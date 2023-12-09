let g_name: string = '';
let g_scroll: number = 0;
let x_scroll: number = 0;
let y_scroll: number = 0;

let g_game: Game;

const thing_names = [
	"chair", // 0
	"lamp",
	"mushroom", // 2
	"outhouse",
	"pillar", // 4
	"pond",
	"rock", // 6
	"statue",
	"tree", // 8
	"turtle",
];

interface OnClickHandler {
	(x:number, y:number): void;
}

interface updateHandler {
    ():void;
}

interface HttpPostCallback {
	(x:any): any;
}

let front = () => {

    let story: string[] = [];
    story.push(`<font size="+3"><b>Bananarama</front size="3"</b><br><br>`);
    story.push(`<font size="+2"><font color="red">In a land known as "Fruitopia," the inhabitants thrived on the delicious and nutritious fruits that grew abundantly. 
    One fruit, in particular, was highly treasured - the mighty banana. 
    Fruitopia's inhabitants had always enjoyed the health benefits and energy provided by this potassium-rich treat, 
    which fueled their daily adventures and brought joy to their lives.`);
    story.push(`But one day, a mysterious phenomenon occurred: the banana crops across Fruitopia began to wither, 
    and the supply of this essential fruit dwindled rapidly.
    As the days passed, the once energetic and lively inhabitants of Fruitopia started to feel weak and fatigued. 
    The doctors and scientists of the land quickly identified the cause - a severe potassium deficiency was spreading among the residents, 
    and it threatened to plunge Fruitopia into a state of perpetual lethargy.
    Desperate to restore the health and vitality of their beloved land, 
    the citizens of Fruitopia are turning to you to help them find 20 bananas.
    The fate of Fruitopia hangs in the balance.</font color="red"></font size="+2"><br><br>`);
    story.push(`<font size="+1">tl;dr: Find 20 bananas to win.</font size="+1"><br><br>`);
    story.push(`<lbal for= "user">If you are willing to undertake this noble quest, enter your name:<br></lbal>
    <input type="text" id="user">
    <button onclick = "push();">Join Bananarama!</button>`);
    const content = document.getElementById('content') as HTMLElement;
    content.innerHTML = story.join('');
}

let onReceiveMap = (ob: any) => {
    console.log(`Map received: ${JSON.stringify(ob)}`);
    const things = ob.map.things;
    
    for (let i = 0; i < things.length; i++) {

        let landmark = things[i];
        g_game.model.sprites.push(new Sprite("", "", landmark.x, landmark.y, `${thing_names[landmark.kind]}.png`, Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
    
    }
}

let push = () => {
    const el = document.getElementById("user") as HTMLInputElement
    g_name = el.value;
    console.log(`g_name = ${g_name}`);


    let s: string[] = [];
    s.push(`<canvas id="myCanvas" width="1000" height="500" style="border:1px solid #cccccc">`);
    s.push(`</canvas>`);
    s.push(`<br><big><big><b>Gold: <span id="gold">0</span> Bananas: <span id="bananas">0</span>
    </b></big></big><br>`)
    s.push(`chat with other players here:<br>`)
    s.push(`<br><select id="chatWindow" size="8" style="width:1000px"></select><br>
    <input type="input" id="chatMessage"></input>
    <button onclick="postChatMessage()">Post</button>`)
    const content = document.getElementById('content') as HTMLElement;
    content.innerHTML = s.join('');
    g_game = new Game();

    httpPost('ajax.html', {
        action: 'get_map',
    }, (ob) => {return onReceiveMap(ob)});

    let timer = setInterval(() => {g_game.onTimer();}, 40);
    }

let onReceiveChat = (ob: any) => {
    if (ob.status === 'error') {
        console.log(`!!! Server replied: ${ob.message}`);
        return;
    }

}

let postChatMessage = () => {
    const chatel = document.getElementById("chatMessage") as HTMLInputElement
    let chat = chatel.value;
    console.log(`chat message = ${chat}`);

    httpPost('ajax.html', {
        action: 'chat',
        id: g_id,
        text: chat

    }, (ob) => {return onReceiveChat(ob)});

    chatel.value = "";

}

const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
}

const g_origin = new URL(window.location.href).origin;
const g_id = random_id(12);

let id_to_sprite: Record<string, Sprite> = {}

front();
// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
const httpPost = (page_name: string, payload: any, callback: HttpPostCallback) => {
	let request = new XMLHttpRequest();
	request.onreadystatechange = () => {
		if(request.readyState === 4)
		{
			if(request.status === 200) {
				let response_obj;
				try {
					response_obj = JSON.parse(request.responseText);
				} catch(err) {}
				if (response_obj) {
					callback(response_obj);
				} else {
					callback({
						status: 'error',
						message: 'response is not valid JSON',
						response: request.responseText,
					});
				}
			} else {
				if(request.status === 0 && request.statusText.length === 0) {
					callback({
						status: 'error',
						message: 'connection failed',
					});
				} else {
					callback({
						status: 'error',
						message: `server returned status ${request.status}: ${request.statusText}`,
					});
				}
			}
		}
	};
	request.open('post', `${g_origin}/${page_name}`, true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify(payload));
}

class Sprite {

    id: string;
    g_name: string;
    x: number;
    y: number;

    speed: number;
    image: HTMLImageElement;
    dest_x: number | undefined;
    dest_y: number | undefined;
    update: updateHandler;
    onclick: OnClickHandler;

    constructor(id: string, g_name: string, x: number, y: number, image_url: string, update_method: updateHandler, onclick_method: OnClickHandler) {
        this.id = id;
        this.g_name = g_name;
        this.x = x;
        this.y = y;
        this.speed = 4;
        this.image = new Image();
        this.image.src = image_url;
        this.update = update_method;
        this.onclick = onclick_method;
    }

    set_destination(x: number, y: number) {
        this.dest_x = x;
        this.dest_y = y;
    }

    ignore_click(x: number, y:number) {
    }

    move(dx: number, dy: number) {
        this.dest_x = this.x + dx;
        this.dest_y = this.y + dy;
    }

    go_toward_destination() {
        if (this.dest_x === undefined || this.dest_y === undefined)
            return;
        if (this.x < this.dest_x)
            this.x += Math.min(this.dest_x - this.x, this.speed);
        else if (this.x > this.dest_x)
            this.x -= Math.min(this.x - this.dest_x, this.speed);
        if (this.y < this.dest_y)
            this.y += Math.min(this.dest_y - this.y, this.speed);
        else if (this.y > this.dest_y)
            this.y -= Math.min(this.y - this.dest_y, this.speed);
    }

    sit_still() {
    }
}

class Model{

    sprites: Sprite[];
    player: Sprite;

    constructor() {
        this.sprites = [];
        this.player = new Sprite(g_id, g_name, 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
        id_to_sprite[g_id] = this.player;
        this.sprites.push(this.player);
    }
    update() {
        for (let i = 0, a = this.sprites; i < a.length; i++) {
            let sprite = a[i];
            sprite.update();
        }
    }
    onclick(x: number, y: number) {
        for (let i = 0, a = this.sprites; i < a.length; i++) {
            let sprite = a[i];
            sprite.onclick(x, y);
        }
    }
    move(dx: number, dy: number) {
        this.player.move(dx, dy);
    }

}

class View{

    model: Model;
    canvas: HTMLCanvasElement;
    player: HTMLImageElement;

    constructor(model: Model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        this.player = new Image();
        this.player.src = "blue_robot.png";
    }

    update() {

        const center_x = 500;
        const center_y = 270;
        const scroll_rate = 0.03;
        x_scroll += scroll_rate * (this.model.player.x - x_scroll - center_x);
        y_scroll += scroll_rate * (this.model.player.y - y_scroll - center_y);

        let ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, 1000, 500);
        ctx.fillStyle = "chartreuse";
        ctx.fillRect(0, 0, 1000, 500);
        ctx.fillStyle = "black";


        for (let i = 0, a = this.model.sprites; i < a.length; i++) {
            
            let sprite = a[i];
            ctx.drawImage(sprite.image, (sprite.x - sprite.image.width / 2) - x_scroll, (sprite.y - sprite.image.height) - y_scroll);

            ctx.font = "20px Verdana";
            ctx.fillText(sprite.g_name, (sprite.x - sprite.image.width / 2) - x_scroll, (sprite.y - sprite.image.height - 10) - y_scroll);
        }
    }
}

class Controller {

    model: Model;
    view:View;
  
    key_right: boolean;
    key_left: boolean;
    key_up: boolean;
    key_down: boolean;

    last_updates_request_time: number = 0;
    
    constructor(model: Model, view: View) {
        this.model = model;
        this.view = view;
        this.key_right = false;
        this.key_left = false;
        this.key_up = false;
        this.key_down = false;
        let self = this;
        view.canvas.addEventListener("click", function (event) { self.onClick(event); });
        document.addEventListener('keydown', function (event) { self.keyDown(event); }, false);
        document.addEventListener('keyup', function (event) { self.keyUp(event); }, false);
    }

    onAcknowledgeClick(ob: any) {
		console.log(`Response to move: ${JSON.stringify(ob)}`);

	}

    on_recieve_updates(ob: any) {
        console.log(`Response to update = ${JSON.stringify(ob)}`);

        if (ob.gold) {

            const goldnum = document.getElementById("gold") as HTMLSpanElement;
            if (goldnum) {
                goldnum.innerHTML = ob.gold;
            }
        }
        if (ob.bananas) {

            const banananum = document.getElementById("bananas") as HTMLSpanElement;
            if (banananum) {
                banananum.innerHTML = ob.bananas;
            }
        }

        const window = document.getElementById("chatWindow") as HTMLSelectElement;
        let chat = ob.chats;

        for (let i = 0; i < chat.length; i++) {
            let option = new Option(chat[i]);
            window.add(option);
            option.scrollIntoView();
        }


        for (let i = 0; i < ob.updates.length; i++) {

            let up = ob.updates[i];
            let id = up.id;
            let name = up.name;
            let x = up.x;
            let y = up.y;
            let sprite = id_to_sprite[id];

            if (sprite === undefined) {

                sprite = new Sprite(g_id, name,50, 50, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
                id_to_sprite[id] = sprite;
                this.model.sprites.push(sprite);

            }
            sprite.set_destination(x, y);
        }
    }

    request_updates() {

        this.last_updates_request_time = Date.now();
        let payload = {
            action: 'update',
            id: g_id
        }
        httpPost('ajax.html', payload, (ob) => {return this.on_recieve_updates(ob);});
    }

    onClick(event: MouseEvent) {
        const x = event.pageX - this.view.canvas.offsetLeft + x_scroll;
        const y = event.pageY - this.view.canvas.offsetTop + y_scroll;

        this.model.onclick(x, y);

        httpPost('ajax.html', {
            action: 'move',
            id: g_id,
            name: g_name,
            x: x,
            y: y,
        }, this.onAcknowledgeClick);
    }

    keyDown(event: KeyboardEvent) {
        if (event.keyCode == 39)
            this.key_right = true;
        else if (event.keyCode == 37)
            this.key_left = true;
        else if (event.keyCode == 38)
            this.key_up = true;
        else if (event.keyCode == 40)
            this.key_down = true;
    }
    keyUp(event: KeyboardEvent) {
        if (event.keyCode == 39)
            this.key_right = false;
        else if (event.keyCode == 37)
            this.key_left = false;
        else if (event.keyCode == 38)
            this.key_up = false;
        else if (event.keyCode == 40)
            this.key_down = false;
    }
    update() {
        let dx = 0;
        let dy = 0;
        let speed = this.model.player.speed;

        if (this.key_right)
            dx += speed;
        if (this.key_left)
            dx -= speed;
        if (this.key_up)
            dy -= speed;
        if (this.key_down)
            dy += speed;
        if (dx != 0 || dy != 0)
            this.model.move(dx, dy);

        const time = Date.now();
        if (time - this.last_updates_request_time >= 1000) {
            this.last_updates_request_time = time;
            this.request_updates();
        }
    }

}

class Game  {

    model: Model;
    view: View;
    controller: Controller;
    constructor() {
        this.model = new Model();
        this.view = new View(this.model);
        this.controller = new Controller(this.model, this.view);
    }
    onTimer() {
        this.controller.update();
        this.model.update();
        this.view.update();
    }
}

const game = new Game();
const timer = setInterval(() => {game.onTimer(); }, 40);