"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var g_name = '';
var g_scroll = 0;
var x_scroll = 0;
var y_scroll = 0;
var g_game;
var thing_names = [
    "chair",
    "lamp",
    "mushroom",
    "outhouse",
    "pillar",
    "pond",
    "rock",
    "statue",
    "tree",
    "turtle",
];
var front = function () {
    var story = [];
    story.push("<font size=\"+3\"><b>Bananarama</front size=\"3\"</b><br><br>");
    story.push("<font size=\"+2\"><font color=\"red\">In a land known as \"Fruitopia,\" the inhabitants thrived on the delicious and nutritious fruits that grew abundantly. \n    One fruit, in particular, was highly treasured - the mighty banana. \n    Fruitopia's inhabitants had always enjoyed the health benefits and energy provided by this potassium-rich treat, \n    which fueled their daily adventures and brought joy to their lives.");
    story.push("But one day, a mysterious phenomenon occurred: the banana crops across Fruitopia began to wither, \n    and the supply of this essential fruit dwindled rapidly.\n    As the days passed, the once energetic and lively inhabitants of Fruitopia started to feel weak and fatigued. \n    The doctors and scientists of the land quickly identified the cause - a severe potassium deficiency was spreading among the residents, \n    and it threatened to plunge Fruitopia into a state of perpetual lethargy.\n    Desperate to restore the health and vitality of their beloved land, \n    the citizens of Fruitopia are turning to you to help them find 20 bananas.\n    The fate of Fruitopia hangs in the balance.</font color=\"red\"></font size=\"+2\"><br><br>");
    story.push("<font size=\"+1\">tl;dr: Find 20 bananas to win.</font size=\"+1\"><br><br>");
    story.push("<lbal for= \"user\">If you are willing to undertake this noble quest, enter your name:<br></lbal>\n    <input type=\"text\" id=\"user\">\n    <button onclick = \"push();\">Join Bananarama!</button>");
    var content = document.getElementById('content');
    content.innerHTML = story.join('');
};
var onReceiveMap = function (ob) {
    console.log("Map received: ".concat(JSON.stringify(ob)));
    var things = ob.map.things;
    for (var i = 0; i < things.length; i++) {
        var landmark = things[i];
        g_game.model.sprites.push(new Sprite("", "", landmark.x, landmark.y, "".concat(thing_names[landmark.kind], ".png"), Sprite.prototype.sit_still, Sprite.prototype.ignore_click));
    }
};
var push = function () {
    var el = document.getElementById("user");
    g_name = el.value;
    console.log("g_name = ".concat(g_name));
    var s = [];
    s.push("<canvas id=\"myCanvas\" width=\"1000\" height=\"500\" style=\"border:1px solid #cccccc\">");
    s.push("</canvas>");
    s.push("<br><big><big><b>Gold: <span id=\"gold\">0</span> Bananas: <span id=\"bananas\">0</span>\n    </b></big></big><br>");
    s.push("chat with other players here:<br>");
    s.push("<br><select id=\"chatWindow\" size=\"8\" style=\"width:1000px\"></select><br>\n    <input type=\"input\" id=\"chatMessage\"></input>\n    <button onclick=\"postChatMessage()\">Post</button>");
    var content = document.getElementById('content');
    content.innerHTML = s.join('');
    g_game = new Game();
    httpPost('ajax.html', {
        action: 'get_map',
    }, function (ob) { return onReceiveMap(ob); });
    var timer = setInterval(function () { g_game.onTimer(); }, 40);
};
var onReceiveChat = function (ob) {
    if (ob.status === 'error') {
        console.log("!!! Server replied: ".concat(ob.message));
        return;
    }
};
var postChatMessage = function () {
    var chatel = document.getElementById("chatMessage");
    var chat = chatel.value;
    console.log("chat message = ".concat(chat));
    httpPost('ajax.html', {
        action: 'chat',
        id: g_id,
        text: chat
    }, function (ob) { return onReceiveChat(ob); });
    chatel.value = "";
};
var random_id = function (len) {
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return __spreadArray([], Array(len), true).reduce(function (a) { return a + p[Math.floor(Math.random() * p.length)]; }, '');
};
var g_origin = new URL(window.location.href).origin;
var g_id = random_id(12);
var id_to_sprite = {};
front();
// Payload is a marshaled (but not JSON-stringified) object
// A JSON-parsed response object will be passed to the callback
var httpPost = function (page_name, payload, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var response_obj = void 0;
                try {
                    response_obj = JSON.parse(request.responseText);
                }
                catch (err) { }
                if (response_obj) {
                    callback(response_obj);
                }
                else {
                    callback({
                        status: 'error',
                        message: 'response is not valid JSON',
                        response: request.responseText,
                    });
                }
            }
            else {
                if (request.status === 0 && request.statusText.length === 0) {
                    callback({
                        status: 'error',
                        message: 'connection failed',
                    });
                }
                else {
                    callback({
                        status: 'error',
                        message: "server returned status ".concat(request.status, ": ").concat(request.statusText),
                    });
                }
            }
        }
    };
    request.open('post', "".concat(g_origin, "/").concat(page_name), true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(payload));
};
var Sprite = /** @class */ (function () {
    function Sprite(id, g_name, x, y, image_url, update_method, onclick_method) {
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
    Sprite.prototype.set_destination = function (x, y) {
        this.dest_x = x;
        this.dest_y = y;
    };
    Sprite.prototype.ignore_click = function (x, y) {
    };
    Sprite.prototype.move = function (dx, dy) {
        this.dest_x = this.x + dx;
        this.dest_y = this.y + dy;
    };
    Sprite.prototype.go_toward_destination = function () {
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
    };
    Sprite.prototype.sit_still = function () {
    };
    return Sprite;
}());
var Model = /** @class */ (function () {
    function Model() {
        this.sprites = [];
        this.player = new Sprite(g_id, g_name, 50, 50, "blue_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.set_destination);
        id_to_sprite[g_id] = this.player;
        this.sprites.push(this.player);
    }
    Model.prototype.update = function () {
        for (var i = 0, a = this.sprites; i < a.length; i++) {
            var sprite = a[i];
            sprite.update();
        }
    };
    Model.prototype.onclick = function (x, y) {
        for (var i = 0, a = this.sprites; i < a.length; i++) {
            var sprite = a[i];
            sprite.onclick(x, y);
        }
    };
    Model.prototype.move = function (dx, dy) {
        this.player.move(dx, dy);
    };
    return Model;
}());
var View = /** @class */ (function () {
    function View(model) {
        this.model = model;
        this.canvas = document.getElementById("myCanvas");
        this.player = new Image();
        this.player.src = "blue_robot.png";
    }
    View.prototype.update = function () {
        var center_x = 500;
        var center_y = 270;
        var scroll_rate = 0.03;
        x_scroll += scroll_rate * (this.model.player.x - x_scroll - center_x);
        y_scroll += scroll_rate * (this.model.player.y - y_scroll - center_y);
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, 1000, 500);
        ctx.fillStyle = "chartreuse";
        ctx.fillRect(0, 0, 1000, 500);
        ctx.fillStyle = "black";
        for (var i = 0, a = this.model.sprites; i < a.length; i++) {
            var sprite = a[i];
            ctx.drawImage(sprite.image, (sprite.x - sprite.image.width / 2) - x_scroll, (sprite.y - sprite.image.height) - y_scroll);
            ctx.font = "20px Verdana";
            ctx.fillText(sprite.g_name, (sprite.x - sprite.image.width / 2) - x_scroll, (sprite.y - sprite.image.height - 10) - y_scroll);
        }
    };
    return View;
}());
var Controller = /** @class */ (function () {
    function Controller(model, view) {
        this.last_updates_request_time = 0;
        this.model = model;
        this.view = view;
        this.key_right = false;
        this.key_left = false;
        this.key_up = false;
        this.key_down = false;
        var self = this;
        view.canvas.addEventListener("click", function (event) { self.onClick(event); });
        document.addEventListener('keydown', function (event) { self.keyDown(event); }, false);
        document.addEventListener('keyup', function (event) { self.keyUp(event); }, false);
    }
    Controller.prototype.onAcknowledgeClick = function (ob) {
        console.log("Response to move: ".concat(JSON.stringify(ob)));
    };
    Controller.prototype.on_recieve_updates = function (ob) {
        console.log("Response to update = ".concat(JSON.stringify(ob)));
        if (ob.gold) {
            var goldnum = document.getElementById("gold");
            if (goldnum) {
                goldnum.innerHTML = ob.gold;
            }
        }
        if (ob.bananas) {
            var banananum = document.getElementById("bananas");
            if (banananum) {
                banananum.innerHTML = ob.bananas;
            }
        }
        var window = document.getElementById("chatWindow");
        var chat = ob.chats;
        for (var i = 0; i < chat.length; i++) {
            var option = new Option(chat[i]);
            window.add(option);
            option.scrollIntoView();
        }
        for (var i = 0; i < ob.updates.length; i++) {
            var up = ob.updates[i];
            var id = up.id;
            var name_1 = up.name;
            var x = up.x;
            var y = up.y;
            var sprite = id_to_sprite[id];
            if (sprite === undefined) {
                sprite = new Sprite(g_id, name_1, 50, 50, "green_robot.png", Sprite.prototype.go_toward_destination, Sprite.prototype.ignore_click);
                id_to_sprite[id] = sprite;
                this.model.sprites.push(sprite);
            }
            sprite.set_destination(x, y);
        }
    };
    Controller.prototype.request_updates = function () {
        var _this = this;
        this.last_updates_request_time = Date.now();
        var payload = {
            action: 'update',
            id: g_id
        };
        httpPost('ajax.html', payload, function (ob) { return _this.on_recieve_updates(ob); });
    };
    Controller.prototype.onClick = function (event) {
        var x = event.pageX - this.view.canvas.offsetLeft + x_scroll;
        var y = event.pageY - this.view.canvas.offsetTop + y_scroll;
        this.model.onclick(x, y);
        httpPost('ajax.html', {
            action: 'move',
            id: g_id,
            name: g_name,
            x: x,
            y: y,
        }, this.onAcknowledgeClick);
    };
    Controller.prototype.keyDown = function (event) {
        if (event.keyCode == 39)
            this.key_right = true;
        else if (event.keyCode == 37)
            this.key_left = true;
        else if (event.keyCode == 38)
            this.key_up = true;
        else if (event.keyCode == 40)
            this.key_down = true;
    };
    Controller.prototype.keyUp = function (event) {
        if (event.keyCode == 39)
            this.key_right = false;
        else if (event.keyCode == 37)
            this.key_left = false;
        else if (event.keyCode == 38)
            this.key_up = false;
        else if (event.keyCode == 40)
            this.key_down = false;
    };
    Controller.prototype.update = function () {
        var dx = 0;
        var dy = 0;
        var speed = this.model.player.speed;
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
        var time = Date.now();
        if (time - this.last_updates_request_time >= 1000) {
            this.last_updates_request_time = time;
            this.request_updates();
        }
    };
    return Controller;
}());
var Game = /** @class */ (function () {
    function Game() {
        this.model = new Model();
        this.view = new View(this.model);
        this.controller = new Controller(this.model, this.view);
    }
    Game.prototype.onTimer = function () {
        this.controller.update();
        this.model.update();
        this.view.update();
    };
    return Game;
}());
var game = new Game();
var timer = setInterval(function () { game.onTimer(); }, 40);
