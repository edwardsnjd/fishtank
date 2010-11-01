// Namespace object
var ft = {};

///////////////////////////////////////////
// MODEL
///////////////////////////////////////////
ft.model = {};

// World
ft.model.world = function() {
	this.tanks = [];
	this.update = function(timeElapsed) {
		this.tanks.each(function(t) {
			t.fish.each(function(f) {
				f.update(timeElapsed);
			});
		});
	};
};

// Tank
ft.model.tank = function(size) {
	this.size = size;
	this.fish = [];
	this.inspect = function() {
		var s = "tank {\n";
		s += "size: { #{size.w}, #{size.h} }\n".interpolate(this);
		s += this.fish.collect(Object.inspect).join("\n");
		s += "\n}";
		return s;
	};
};

// Fish
ft.model.fish = function(tank, colour) {
	var maxVelocity = { x:5, y:2.8 };

	this.id = ft.model.fish.getId();
	this.tank = tank;
	this.position = { x:Math.floor(Math.random() * tank.size.w), y:Math.floor(Math.random() * tank.size.h) };
	this.velocity = {
		x:(Math.random() * 2 * maxVelocity.x) - maxVelocity.x,
		y:(Math.random() * 2 * maxVelocity.y) - maxVelocity.y
	};
	this.colour = colour;
	this.update = ft.model.fish.linearMovement;
	this.inspect = function() {
		var s = "fish {\n";
		s += "\tid: #{id},\n".interpolate(this);
		s += "\tposition: { #{position.x}, #{position.y} },\n".interpolate(this);
		s += "\tvelocity: { #{velocity.x}, #{velocity.y} },\n".interpolate(this);
		s += "\tcolour: #{colour}\n".interpolate(this);
		s += "}".interpolate(this)
		return s;
	};
};
// Static fish members
ft.model.fish.counter = 0;
ft.model.fish.getId = function() {
	var id = ft.model.fish.counter;
	ft.model.fish.counter++;
	return id;
};
// Movement
ft.model.fish.linearMovement = function(dt) {
	var rawX = this.position.x + this.velocity.x * dt;
	var rawY = this.position.y + this.velocity.y * dt;
	var nX = Math.floor(rawX / this.tank.size.w);
	var nY = Math.floor(rawY / this.tank.size.h);
	// Update position
	this.position.x = (nX % 2 == 0) ? rawX - (nX * this.tank.size.w) : -1 * rawX + ((nX + 1) * this.tank.size.w);
	this.position.y = (nY % 2 == 0) ? rawY - (nY * this.tank.size.h) : -1 * rawY + ((nY + 1) * this.tank.size.h);
	// Update velocity
	this.velocity.x *= (nX % 2 == 0) ? 1 : -1;
	this.velocity.y *= (nY % 2 == 0) ? 1 : -1;
};

///////////////////////////////////////////
// UI
///////////////////////////////////////////
ft.ui = {};

ft.ui.world = function() {
	this.tanks = [];
	this.render = function() {
		this.tanks.each(function(t) {
			t.render();
		});
	};
};

// Textarea tank
ft.ui.areaTank = function(container, tank) {
	container = $(container);
	
	this.render = function() {
		container.update(Object.inspect(tank));
	};
};

// DOM tank
ft.ui.domTank = function(container, tank) {
	container = $(container);
	
	var w = container.getWidth();
	var h = container.getHeight();

	var images = {};
	
	this.render = function() {
		// Draw image for each fish
		tank.fish.each(function(f) {
			// Look for image for fish
			var image = images[f.id];
			if (!image) {
				image = new Element("img", {style: "position: absolute;"});
				container.insert(image);
				images[f.id] = image;
			}
			// Switch direction
			var goingRight = (f.velocity.x > 0);
			var src;
			switch(f.colour) {
				case "yellow":
					src = goingRight ? "images/yellow_r.png" : "images/yellow_l.png";
					break;
				case "red":
					src = goingRight ? "images/red_r.png" : "images/red_l.png";
					break;
				case "blue":
					src = goingRight ? "images/blue_r.png" : "images/blue_l.png";
					break;
				default:
					src = goingRight ? "images/yellow_r.png" : "images/yellow_l.png";
					break;
			}
			image.setAttribute("src", src);
			// Position image
			var fw = image.getWidth();
			var fh = image.getHeight();
			var x = Math.floor((f.position.x / tank.size.w) * (w - fw));
			var y = Math.floor((f.position.y / tank.size.h) * (h - fh));
			image.setStyle({
				left: x + "px",
				top: y + "px"
			});
		});
	};
};

///////////////////////////////////////////
// CONTROLLER
///////////////////////////////////////////
ft.controller = function(world, ui) {
	var interval = null;
	var lastTick = null;
	
	this.start = function() {
		this.stop();
		lastTick = new Date();
		this.interval = setInterval(this.tick.bind(this), 75);
	};
	this.stop = function() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	};
	this.tick = function() {
		// Find elapsed time
		var now = new Date();
		var elapsed = (now.getTime() - lastTick.getTime()) / 1000;
		lastTick = now;
		// Update world objects
		world.update(elapsed);
		// Render world
		ui.render(world);
	};
};


///////////////////////////////////////////
// PAGE CODE
///////////////////////////////////////////
Event.observe(window, "load", function() {
	var tank1 = new ft.model.tank({ w:100, h:100 });
	
	tank1.fish.push(new ft.model.fish(tank1, "yellow"));
	tank1.fish.push(new ft.model.fish(tank1, "yellow"));
	tank1.fish.push(new ft.model.fish(tank1, "red"));
	tank1.fish.push(new ft.model.fish(tank1, "blue"));
	tank1.fish.push(new ft.model.fish(tank1, "blue"));
	tank1.fish.push(new ft.model.fish(tank1, "blue"));
	tank1.fish.push(new ft.model.fish(tank1, "blue"));
	tank1.fish.push(new ft.model.fish(tank1, "blue"));
	tank1.fish.push(new ft.model.fish(tank1, "red"));
	tank1.fish.push(new ft.model.fish(tank1, "red"));
	tank1.fish.push(new ft.model.fish(tank1, "red"));
	tank1.fish.push(new ft.model.fish(tank1, "yellow"));
	
	var world = new ft.model.world();
	world.tanks.push(tank1);
	
	var worldUI = new ft.ui.world();
	worldUI.tanks.push(new ft.ui.domTank("tankDom", tank1));
//	worldUI.tanks.push(new ft.ui.areaTank("tankArea", tank1));
	
	var controller = new ft.controller(world, worldUI);
	controller.start();
});