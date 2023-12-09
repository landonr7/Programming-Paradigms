interface OnClickHandler {
	(x:number, y:number): void;
}

interface updateHandler {
    ():void;
}

interface HttpPostCallback {
	(x:any): any;
}

const random_id = (len:number) => {
    let p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a => a + p[Math.floor(Math.random() * p.length)], '');
}

const g_origin = new URL(window.location.href).origin;
const g_id = random_id(12);

let id_to_sprite: Record<string, Sprite> = {}

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
    x: number;
    y: number;

    speed: number;
    image: HTMLImageElement;
    dest_x: number | undefined;
    dest_y: number | undefined;
    update: updateHandler;
    onclick: OnClickHandler;

    constructor(id: string, x: number, y: number, image_url: string, update_method: updateHandler, onclick_method: OnClickHandler) {
        this.id = id;
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
    turtle: Sprite;

    constructor() {
        this.sprites = [];
        this.turtle = new Sprite(g_id, 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
        id_to_sprite[g_id] = this.turtle;
        this.sprites.push(this.turtle);
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
        this.turtle.move(dx, dy);
    }

}

class View{

    model: Model;
    canvas: HTMLCanvasElement;
    turtle: HTMLImageElement;

    constructor(model: Model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        this.turtle = new Image();
        this.turtle.src = "turtle.png";
    }

    update() {
        let ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, 1000, 500);
        for (let i = 0, a = this.model.sprites; i < a.length; i++) {
            let sprite = a[i];
            ctx.drawImage(sprite.image, sprite.x - sprite.image.width / 2, sprite.y - sprite.image.height);
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

    on_recieve_updates(ob: {updates: string | any[];}) {
        console.log(`Response to update = ${JSON.stringify(ob)}`);


        for (let i = 0; i < ob.updates.length; i++) {
            let up = ob.updates[i];
            let id = up[0];
            let x = up[1];
            let y = up[2];

            let sprite = id_to_sprite[id];

            if (sprite === undefined) {
                sprite = new Sprite(g_id, 50, 50, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
                id_to_sprite[id] = sprite;
                this.model.sprites.push(sprite);
            }
            sprite.set_destination(x, y);

        }
    }

    request_updates() {

        this.last_updates_request_time = Date.now();
        let payload = {
            id: g_id,
            action: 'updates',
        }
        httpPost('ajax.html', payload, (ob) => {return this.on_recieve_updates(ob);});
    }

    onClick(event: MouseEvent) {
        const x = event.pageX - this.view.canvas.offsetLeft;
        const y = event.pageY - this.view.canvas.offsetTop;

        this.model.onclick(x, y);

        httpPost('ajax.html', {
            id: g_id,
            action: 'move',
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
        let speed = this.model.turtle.speed;
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