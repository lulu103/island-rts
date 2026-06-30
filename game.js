
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}
addEventListener("resize",resize); resize();

const castle={x:innerWidth-90,y:100,hp:1000,maxHp:1000};
const forest={x:250,y:220,r:120};
const whirlpool={x:180,y:innerHeight-150,r:55};
const volcano={x:innerWidth*0.75,y:innerHeight*0.7,r:50};

let currentPath=[],drawing=false;
let resource={x:volcano.x,y:volcano.y,active:true};

const unit={
 x:100,y:100,r:12,speed:2,path:[],targetIndex:0,
 carrying:false
};

const enemies=[];

function spawnEnemy(){
 enemies.push({
   x:Math.random()*canvas.width,
   y:canvas.height+30,
   r:14,
   speed:0.8
 });
}
setInterval(spawnEnemy,5000);

function pos(e){
 const p=e.touches?e.touches[0]:e;
 return {x:p.clientX,y:p.clientY};
}
function start(e){drawing=true;currentPath=[];add(e);}
function move(e){if(drawing)add(e);}
function end(){
 drawing=false;
 if(currentPath.length>1){
   unit.path=[...currentPath];
   unit.targetIndex=0;
 }
}
function add(e){
 const p=pos(e);
 const last=currentPath[currentPath.length-1];
 if(!last||Math.hypot(p.x-last.x,p.y-last.y)>8)
   currentPath.push(p);
}
canvas.addEventListener("mousedown",start);
canvas.addEventListener("mousemove",move);
window.addEventListener("mouseup",end);
canvas.addEventListener("touchstart",start);
canvas.addEventListener("touchmove",move);
window.addEventListener("touchend",end);

function updateUnit(){
 let speed=2;
 if(Math.hypot(unit.x-forest.x,unit.y-forest.y)<forest.r)
   speed=1;

 if(Math.hypot(unit.x-whirlpool.x,unit.y-whirlpool.y)<whirlpool.r){
   unit.x=100; unit.y=100;
   unit.path=[]; unit.targetIndex=0;
 }

 if(unit.targetIndex<unit.path.length){
   const t=unit.path[unit.targetIndex];
   const dx=t.x-unit.x, dy=t.y-unit.y;
   const d=Math.hypot(dx,dy);
   if(d<speed){
     unit.x=t.x; unit.y=t.y; unit.targetIndex++;
   }else{
     unit.x+=dx/d*speed;
     unit.y+=dy/d*speed;
   }
 }

 if(resource.active &&
    Math.hypot(unit.x-resource.x,unit.y-resource.y)<25){
      resource.active=false;
      unit.carrying=true;
 }

 if(unit.carrying &&
    Math.hypot(unit.x-castle.x,unit.y-castle.y)<50){
      unit.carrying=false;
      resource={
        x:volcano.x,
        y:volcano.y,
        active:true
      };
      castle.hp=Math.min(castle.maxHp,castle.hp+50);
 }
}

function updateEnemies(){
 for(const e of enemies){
   let tx=castle.x, ty=castle.y;
   if(Math.hypot(unit.x-e.x,unit.y-e.y)<250){
      tx=unit.x; ty=unit.y;
   }
   const dx=tx-e.x, dy=ty-e.y;
   const d=Math.hypot(dx,dy);
   e.x+=dx/d*e.speed;
   e.y+=dy/d*e.speed;

   if(Math.hypot(e.x-castle.x,e.y-castle.y)<35){
      castle.hp-=0.1;
   }
 }
}

function drawCircle(x,y,r,c){
 ctx.fillStyle=c;
 ctx.beginPath();
 ctx.arc(x,y,r,0,Math.PI*2);
 ctx.fill();
}

function drawPath(p,c){
 if(p.length<2)return;
 ctx.strokeStyle=c;
 ctx.lineWidth=5;
 ctx.beginPath();
 ctx.moveTo(p[0].x,p[0].y);
 p.forEach(v=>ctx.lineTo(v.x,v.y));
 ctx.stroke();
}

function draw(){
 ctx.fillStyle="#86df6a";
 ctx.fillRect(0,0,canvas.width,canvas.height);

 ctx.fillStyle="#2345ff";
 ctx.fillRect(0,canvas.height*0.65,canvas.width,canvas.height);

 drawCircle(forest.x,forest.y,forest.r,"#1c6b1c");

 ctx.strokeStyle="#000";
 ctx.lineWidth=5;
 ctx.beginPath();
 ctx.arc(whirlpool.x,whirlpool.y,whirlpool.r,0,Math.PI*2);
 ctx.stroke();

 drawCircle(volcano.x,volcano.y,volcano.r,"#b54a2d");

 if(resource.active)
   drawCircle(resource.x,resource.y,10,"gold");

 ctx.fillStyle="#7b3f00";
 ctx.fillRect(castle.x-20,castle.y-20,40,40);

 drawPath(unit.path,"white");
 if(drawing) drawPath(currentPath,"yellow");

 drawCircle(unit.x,unit.y,unit.r,unit.carrying?"orange":"cyan");

 enemies.forEach(e=>drawCircle(e.x,e.y,e.r,"black"));

 ctx.fillStyle="white";
 ctx.fillRect(20,20,200,18);
 ctx.fillStyle="red";
 ctx.fillRect(20,20,200*(castle.hp/castle.maxHp),18);
 ctx.fillStyle="black";
 ctx.fillText("Castle HP "+Math.floor(castle.hp),25,34);

 ctx.fillText("畫線移動→拿金色資源→送回城堡",20,60);

 if(castle.hp<=0){
   ctx.fillStyle="rgba(0,0,0,.7)";
   ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle="white";
   ctx.font="40px sans-serif";
   ctx.fillText("GAME OVER",canvas.width/2-120,canvas.height/2);
 }
}

function loop(){
 updateUnit();
 updateEnemies();
 draw();
 requestAnimationFrame(loop);
}
loop();
