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
	name: "RedeGlide",
	category: "Movement",
	description: "Redesky glide",
}, function (module) {
	module.on("update", function () {
		if (mc.thePlayer.onGround) {
			mc.thePlayer.jump();
		} else {
            mc.timer.timerSpeed = 5.0;
            mc.thePlayer.motionY += 0.07;
            mc.thePlayer.speedInAir = 0.08;
            mc.thePlayer.sendQueue.addToSendQueue(new C03PacketPlayer.C06PacketPlayerPosLook(mc.thePlayer.posX, mc.thePlayer.posY, mc.thePlayer.posZ, mc.thePlayer.rotationYaw, mc.thePlayer.rotationPitch, onGround));
            mc.thePlayer.sendQueue.addToSendQueue(new C03PacketPlayer.C06PacketPlayerPosLook(mc.thePlayer.posX + 31, mc.thePlayer.posY + 16, mc.thePlayer.posZ + 11, mc.thePlayer.rotationYaw, mc.thePlayer.rotationPitch, onGround));
        }
    });
	module.on("disable", function() {
        mc.thePlayer.speedInAir = 0.02;
		mc.timer.timerSpeed = 1;
		ticks = 0;
	});
});
script.registerModule({
	name: "RedeVelocity",
	category: "Combat",
	description: "Redesky velocity",
}, function (module) {
	module.on("packet", function (event) {
		if (event.getPacket() instanceof S12PacketEntityVelocity) {
            var s12 = event.getPacket();
            if (s12.getEntityID() != mc.thePlayer.getEntityId()) return;
            mc.thePlayer.sendQueue.addToSendQueue(new C03PacketPlayer.C06PacketPlayerPosLook(mc.thePlayer.posX + 31, mc.thePlayer.posY + 16, mc.thePlayer.posZ + 11, mc.thePlayer.rotationYaw, mc.thePlayer.rotationPitch, onGround));
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
				"Get good, get RedeCore v2 ()" ];

function getRandomSult(name, private) {
	if (private) return "/tell " + name + " " + killSults[Math.floor((Math.random()*killSults.length))].toString().replace("%s, ", "").replace("%s", "you");
	return killSults[Math.floor((Math.random()*killSults.length))].toString().replace("%s", name);
}

var Timer = Java.type('java.util.Timer');
function timeout(ms, func) { (_timer = new Timer("setTimeout", true), _timer.schedule(func, ms), _timer); }
