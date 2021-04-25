/// api_version=2
var C03PacketPlayer = Java.type("net.minecraft.network.play.client.C03PacketPlayer");
var S02PacketChat = Java.type("net.minecraft.network.play.server.S02PacketChat");
var script = registerScript({
	name: "RedeCore",
	version: "1.0.0",
	authors: ["DavidMagMC"]
});
script.registerModule({
	name: "RedeCore",
	category: "Misc",
	description: "OP Redesky bypasses",
}, function (module) {
	module.on("enable", function () {
		Chat.print(getPrefix() + "Made by https://forums.ccbluex.net/user/david-0 -- this script is in active development, please inform me if bugs occur or features need to be added/updated.");
    });
});
function getPrefix() {
	return "§7[§cRedeCore§7] §f";
}
script.registerModule({
	name: "RedeSpeed",
	category: "Movement",
	description: "Redesky speed",
	settings: {
        motionYSetting: Setting.float({
            name: "MotionY",
			default: 0.48,
			min: 0.32,
			max: 1.0
        }),
        speedSetting: Setting.float({
            name: "Speed",
			default: 1.0,
			min: 1.0,
			max: 1.1
        })
    }
}, function (module) {
	module.on("update", function () {
		var speed = 1;
		if (mc.thePlayer.onGround) {
			if (mc.thePlayer.moveForward == 0 && mc.thePlayer.moveStrafing == 0) return;
			mc.thePlayer.jump();
			mc.thePlayer.motionY = module.settings.motionYSetting.get();
			speed = module.settings.speedSetting.get();
		}
		mc.thePlayer.motionX *= speed;
		mc.thePlayer.motionZ *= speed;
		speed = Math.max(1, speed / (1 + 1.0E-6));
    });
});
script.registerModule({
	name: "RedeSpider",
	category: "Movement",
	description: "Redesky spider",
}, function (module) {
	var stepped = false;
	module.on("update", function () {
		if (stepped && mc.timer.timerSpeed < 1) mc.timer.timerSpeed = 1;
		if (mc.thePlayer.isCollidedHorizontally) {
			if (mc.thePlayer.moveForward == 0 && mc.thePlayer.moveStrafing == 0) return;
			mc.timer.timerSpeed = 0.3;
			stepped = true;
			if (mc.thePlayer.ticksExisted % 3 == 0) {
				mc.thePlayer.jump();	
			}
		}
    });
	module.on("disable", function() {
		mc.timer.timerSpeed = 1;
		stepped = false;
	});
});
script.registerModule({
	name: "RedeGlide",
	category: "Movement",
	description: "Redesky glide",
}, function (module) {
	module.on("update", function () {
		if (mc.thePlayer.onGround) {
			mc.thePlayer.jump();
			mc.thePlayer.motionY = 0.52;
		} else {
			mc.thePlayer.capabilities.isFlying = true;
			mc.thePlayer.motionY -= 0.01;
		}
    });
	module.on("disable", function() {
		mc.thePlayer.capabilities.isFlying = false;
		mc.timer.timerSpeed = 1;
		ticks = 0;
	});
});
script.registerModule({
	name: "RedeClip",
	category: "Movement",
	description: "Redesky vclip",
}, function (module) {
	module.on("enable", function() {
		spoof(-1.0E-8, mc.thePlayer.onGround);
		spoof(-1.0E-4, mc.thePlayer.onGround);
	});
});
script.registerModule({
	name: "RedeSults",
	category: "Combat",
	description: "Redesky killsults",
}, function (module) {
	module.on("packet", function(event) {
		var packet = event.getPacket();
		if (packet instanceof S02PacketChat) {
            var a = packet.getChatComponent().getUnformattedText();
            if (a.indexOf("foi morto por " + mc.thePlayer.getName()) != -1) {
                var split = a.replace(" foi morto por " + mc.thePlayer.getName(), "").replace(".", "").replace("!", "").replace("FINAL", "").split(' ');
                mc.thePlayer.sendChatMessage(getRandomSult(split[0]));
            }
		}
	});
});

var killSults = [ "%s just got core'd!", "%s, magine getting killed by a LiquidBounce free addon.", "RedeCore is on top of %s!" ];

function getRandomSult(name) {
	return killSults[Math.floor((Math.random()*killSults.length))].toString().replace("%s", name.toString());
}

function spoof(y, onGround) {
	mc.thePlayer.sendQueue.addToSendQueue(new C03PacketPlayer.C04PacketPlayerPosition(mc.thePlayer.posX, mc.thePlayer.posY + y, mc.thePlayer.posZ, onGround));
}