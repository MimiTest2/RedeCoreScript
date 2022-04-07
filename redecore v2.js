/// api_version=2
var C03PacketPlayer = Java.type("net.minecraft.network.play.client.C03PacketPlayer");
var S12PacketEntityVelocity = Java.type("net.minecraft.network.play.server.S12PacketEntityVelocity");
var S02PacketChat = Java.type("net.minecraft.network.play.server.S02PacketChat");
var Pattern = Java.type("java.util.regex.Pattern");
var Matcher = Java.type("java.util.regex.Matcher");

var script = registerScript({
	name: "RedeCore",
	version: "2.0.0",
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
	return "§7[§cRedeCore §bv2§7] §f";
}
script.registerModule({
	name: "RedeSpeed",
	category: "Movement",
	description: "Redesky speed",
}, function (module) {
	module.on("update", function () {
		if (mc.thePlayer.onGround) {
			mc.thePlayer.jump();
			mc.timer.timerSpeed = 5.0;
		} else {
			mc.timer.timerSpeed = 1.0;
        }
    });
	module.on("disable", function() {
		mc.timer.timerSpeed = 1;
	});
});
script.registerModule({
	name: "RedeGlide",
	category: "Movement",
	description: "Redesky glide"
}, function (module) {
	module.on("update", function () {
			if (mc.thePlayer.onGround) {
				mc.thePlayer.jump();
			} else {
  			mc.timer.timerSpeed = 2.0;
                            mc.thePlayer.motionY += 0.01;
                            mc.thePlayer.speedInAir = 0.08;
                            var  motiony = mc.thePlayer.motionY;
                            mc.thePlayer.jump();
                            mc.thePlayer.motionX *= 0.79;
                            mc.thePlayer.motionZ *= 0.79;
                            mc.thePlayer.motionY = motiony;
			}
        }
    });
	module.on("disable", function() {
        mc.thePlayer.speedInAir = 0.02;
		mc.timer.timerSpeed = 1;
	});
});

function getSpeed() {
	return Math.sqrt(mc.thePlayer.motionX * mc.thePlayer.motionX + mc.thePlayer.motionZ * mc.thePlayer.motionZ);
}

function getDirection() {
	var yaw = mc.thePlayer.rotationYaw;
	var roundedStrafing = Math.max(-1, Math.min(1, Math.round(mc.thePlayer.moveStrafing * 100))),
			roundedForward = Math.max(-1, Math.min(1, Math.round(mc.thePlayer.moveForward * 100)));
	if (roundedStrafing !== 0)
		yaw -= 90 * roundedStrafing * (roundedForward !== 0 ? roundedForward * 0.5 : 1);
	if (roundedForward < 0) yaw += 180;
	return yaw * Math.PI / 180;
}
script.registerModule({
	name: "RedeVelocity",
	category: "Combat",
	description: "Redesky velocity",
	settings: {
	    packets: Setting.integer({
		    name: "Packets",
		    default: 1,
		    min: 1,
		    max: 20
	    })
	}
}, function (module) {
	module.on("packet", function (event) {
		if (event.getPacket() instanceof S12PacketEntityVelocity) {
            var s12 = event.getPacket();
            if (s12.getEntityID() === mc.thePlayer.getEntityId()) {
            	for (var i = 0; i < module.settings.packets.get(); i++) {
					mc.thePlayer.sendQueue.addToSendQueue(new C03PacketPlayer.C06PacketPlayerPosLook(mc.thePlayer.posX + 1.7E+24, mc.thePlayer.posY + 1.7E+24, mc.thePlayer.posZ + 1.7E+24, 
						mc.thePlayer.rotationYaw, mc.thePlayer.rotationPitch, mc.thePlayer.onGround));
				}
			}
		}
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

var killSults = [ "%s just got core'd!", "%s, imagine getting killed by a LiquidBounce free addon.", "RedeCore v2 is on top of %s!", 
				"Get good, get RedeCore v2 (https://forums.ccbluex.net/topic/3813/redecore-v2)" ];

function getRandomSult(name, private) {
	if (private) return "/tell " + name + " " + killSults[Math.floor((Math.random()*killSults.length))].toString().replace("%s, ", "").replace("%s", "you");
	return killSults[Math.floor((Math.random()*killSults.length))].toString().replace("%s", name);
}

var Timer = Java.type('java.util.Timer');
function timeout(ms, func) { (_timer = new Timer("setTimeout", true), _timer.schedule(func, ms), _timer); }
