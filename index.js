// console.log(gsap);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// innerWidth is a window property, so no need to write window.innerWidth
canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreElement = document.querySelector('#scoreElement');
const startGameButton = document.querySelector('#startGameButton');
const modalElement = document.querySelector('#modalElement');
const bigScoreElement = document.querySelector('#bigScoreElement');

class Player{
    constructor(x, y, radius, color){
        // the RHS (elements after = ) are what we specify when we 
        // call the constructor to create a new player
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    // FUNCTION to draw the player - you can name it whatever you want
    // From 0 (start angle) to Math.Pi * 2 (finish angle) we have a full circle
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}


class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;

class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1; //by default 1
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
console.log(canvas);
console.log(ctx);
console.log(player);

// create a group of array and shoot them al at the same time 
//initially they were "const", but we need to be able to use them in the new function init()
//so make them "let", the variable player above too!
let projectiles = [];
let enemies = [];
let particles = [];

function init(){
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreElement.innerHTML = score;
    bigScoreElement.innerHTML = score;
}

function spawnEnemies(){

    // this function, calls the code every x-milliseconds (1000 in our case)
    setInterval( ()=>{
        const radius = Math.random() * (30 - 4) + 4;

        let x;
        let y;
        if(Math.random() < 0.5 ){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        // ${Math.random() * 360} is called a template literal
        const color = `hsl( ${Math.random() * 360} , 50%, 50%)`;
        const angle = Math.atan2(canvas.height/2 - y,
            canvas.width/2 - x) ;
        const velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
}

/*
const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'blue', {x:1, y:1});
projectile.draw();
projectile.update();
*/

let animationId;
let score = 0;

// FUNCTION to animate
function animate(){
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; // the opacity 0.1, gives the fade effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) =>{
        if(particle.alpha <= 0){
            particles.splice(index, 1);
        }else{
        particle.update();
        }
    });

    projectiles.forEach( (projectile, index) =>{
        projectile.update();

        // remove from edges of screen
        if(
            //left edge
            projectile.x + projectile.radius < 0 || 
            //right edge
            projectile.x - projectile.radius > canvas.width ||
            //top edge
            projectile.y + projectile.radius < 0 || 
            //bottom edge
            projectile.y - projectile.radius > canvas.height
            ){
            setTimeout( ()=> {
                projectiles.splice(index, 1)
            }, 1)
        }
    })

    enemies.forEach((enemy, index) =>{
        enemy.update();
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        //game over
        if(distance - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            modalElement.style.display = 'flex';
            bigScoreElement.innerHTML = score;
        }

        projectiles.forEach( (projectile, projectileIndex )=>{
            // hypot = hypotenuses, we can reuse distance, since we redeclare it,
            // it's in another scope
            // it will be like having 2 different variables
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            // when projectiles touch enemy
            if(distance - enemy.radius - projectile.radius < 1){
                //create explosions
                for(let i=0; i<enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, 
                        projectile.y, Math.random()*2, enemy.color, 
                        {x:(Math.random() - 0.5) * (Math.random()*6), 
                            y:(Math.random() - 0.5)* (Math.random()*6)}));
                }
                if(enemy.radius - 10 > 5){

                    // increase our score 
                    score += 100;
                    scoreElement.innerHTML = score;

                    gsap.to(enemy, {
                        radius:enemy.radius - 10
                    });
		    //use setTimeout, so when we remove an element graphics won't flicker
                    setTimeout( () =>{
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }else{
                    //remove from scene altogether
                    //increase our score a bit more
                    score += 250;
                    scoreElement.innerHTML = score;
                    
                    setTimeout( () =>{
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
}

// window.addEventListener same as, addEventListener
addEventListener('click', (event)=>{
    
    const angle = Math.atan2(event.clientY - canvas.height/2,
        event.clientX - canvas.width/2);
    const velocity = {
        x:Math.cos(angle) * 5,
        y:Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, 'white', velocity));

});

startGameButton.addEventListener('click', ()=>{
    init();
    animate();
    spawnEnemies();
    modalElement.style.display = 'none';
});
