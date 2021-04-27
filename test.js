/// api_version=2
var C03PacketPlayer = Java.type("net.minecraft.network.play.client.C03PacketPlayer");
var C09PacketHeldItemChange = Java.type("net.minecraft.network.play.client.C09PacketHeldItemChange");
var C07PacketPlayerDigging = Java.type("net.minecraft.network.play.client.C07PacketPlayerDigging");
var C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement");
var BlockPos = Java.type("net.minecraft.util.BlockPos");
var EnumFacing = Java.type("net.minecraft.util.EnumFacing");
var ItemAppleGold = Java.type("net.minecraft.item.ItemAppleGold");
var S02PacketChat = Java.type("net.minecraft.network.play.server.S02PacketChat");
var Pattern = Java.type("java.util.regex.Pattern");
var Matcher = Java.type("java.util.regex.Matcher");

var script = registerScript({
	name: "RedeCore",
	version: "1.0.0",
	authors: ["DavidMagMC", "0x16#7207", "xazed"]
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
			mc.thePlayer.motionY = 0.42;
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
	name: "RedeJump",
	category: "Movement",
	description: "Redesky Longjump",
}, function (module) {
	var ticks = 0;
	module.on("update", function () {
		if (mc.thePlayer.onGround) {
			if (ticks > 0) {
				module.setState(false);
				return;
			}
			mc.thePlayer.jump();
			mc.thePlayer.motionY = 0.48;
		} else {
			mc.thePlayer.motionY += 0.03;
			if (ticks <= 20) {
				mc.thePlayer.motionY += 0.09;
				mc.thePlayer.motionY -= mc.thePlayer.motionY * 0.1;
				mc.thePlayer.motionX *= 1.14;
				mc.thePlayer.motionZ *= 1.14;
			} else {
				mc.thePlayer.motionX *= 1.02;
				mc.thePlayer.motionZ *= 1.02;
			}
			ticks++;
		}
    });
	module.on("disable", function() {
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
		module.setState(false);
	});
});
script.registerModule({
	name: "RedeSults",
	category: "Combat",
	description: "Redesky killsults",
	settings: { //Added send timeout and message type
	    sendType: Setting.list({
		    name: "SendMessage-Type",
		    default: "Public",
		    values: ["Public", "Private"]
	    }),
	    sendDelay: Setting.integer({
		    name: "SendMessage-Delay",
		    default: 0,
		    min: 0,
		    max: 5000
	    })
	}
}, function (module) {
	module.on("packet", function(event) {
		var packet = event.getPacket();
		if (packet instanceof S02PacketChat) { //Better message detection using Pattern and Matcher Java class. TODO detect new Redesky death message packs
            var a = packet.getChatComponent().getUnformattedText();
	    var patternMatcher = Pattern.compile("(.*) foi morto por (.*)");
	    var matchReturn = patternMatcher.matcher(a);
	    if (!matchReturn.find()) return;
	    var chatTarget = matchReturn.group(1);
	    var killer = matchReturn.group(2);
	    if (killer.match(mc.thePlayer.getName()))
                timeout(module.settings.sendDelay.get(), function() {
			mc.thePlayer.sendChatMessage(getRandomSult(chatTarget, (module.settings.sendType.get() == "Private")))
		});
		}
	});
});

var killSults = [ "%s just got core'd!", "%s, imagine getting killed by a LiquidBounce free addon.", "RedeCore is on top of %s!", 
				"Get good, get RedeCore (https://bit.ly/2QtDcwM)" ];

function getRandomSult(name, private) { //didn't test this
	if (private) return "/tell " + name + " " + killSults[Math.floor((Math.random()*killSults.length))].toString().replace("%s, ", "").replace("%s", "you");
	return killSults[Math.floor((Math.random()*killSults.length))].toString().replace("%s", name);
}

var Timer = Java.type('java.util.Timer');
function timeout(ms, func) { (_timer = new Timer("setTimeout", true), _timer.schedule(func, ms), _timer); }

function spoof(y, onGround) {
	mc.thePlayer.sendQueue.addToSendQueue(new C03PacketPlayer.C04PacketPlayerPosition(mc.thePlayer.posX, mc.thePlayer.posY + y, mc.thePlayer.posZ, onGround));
}
