const { Command } = require('discord.js-commando');
const Canvas = require('canvas');
const request = require('superagent');
const moment = require('moment');
const path = require('path');

module.exports = class CardCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'card',
            aliases: ['discord-card'],
            group: 'avataredit',
            memberName: 'card',
            description: 'Creates a Profile Card for the User.',
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which user would you like to edit the avatar of?',
                    type: 'member'
                }
            ]
        });
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    async run(msg, args) {
        if (!msg.channel.permissionsFor(this.client.user).has('ATTACH_FILES'))
            return msg.say('This Command requires the `Attach Files` Permission.');
        const { member } = args;
        const username = member.displayName;
        const discordJoin = moment(member.user.createdTimestamp).format('MMMM Do YYYY');
        const serverJoin = moment(member.joinedTimestamp).format('MMMM Do YYYY');
        const owner = this.client.isOwner(member.user);
        const discrim = `#${member.user.discriminator}`;
        const cardID = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        let rarity;
        if (cardID < 5000) rarity = 'C';
        else if (cardID < 8000) rarity = 'U';
        else rarity = 'R';
        const avatarURL = member.user.avatarURL('png', 2048);
        if (!avatarURL) return msg.say('This user has no avatar.');
        try {
            const Image = Canvas.Image;
            Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', 'OpenSans.ttf'), { family: 'Open Sans' });
            const canvas = new Canvas(390, 544);
            const ctx = canvas.getContext('2d');
            const base = new Image();
            const avatar = new Image();
            const crown = new Image();
            const generate = () => {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 390, 544);
                ctx.drawImage(avatar, 11, 11, 370, 370);
                ctx.drawImage(base, 0, 0);
                if (owner) ctx.drawImage(crown, 60, 480, 40, 30);
                ctx.font = '18px Open Sans';
                ctx.fillStyle = 'black';
                ctx.fillText(username, 30, 65);
                ctx.fillText('Discord Join Date:', 148, 400);
                ctx.fillText(discordJoin, 148, 420);
                ctx.fillText('Server Join Date:', 148, 457);
                ctx.fillText(serverJoin, 148, 477);
                ctx.fillText(rarity, 73, 416);
                ctx.fillText(cardID, 58, 460);
                ctx.font = '14px Open Sans';
                ctx.fillText(member.id, 28, 355);
                ctx.fillText(discrim, 306, 359);
            };
            const cardImg = await request
                .get('https://i.imgur.com/6j8RHk1.png');
            const avatarImg = await request
                .get(avatarURL);
            const crownImg = await request
                .get('https://i.imgur.com/HK4Fnus.png');
            base.src = cardImg.body;
            avatar.src = avatarImg.body;
            crownImg.src = crownImg.body;
            generate();
            return msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: 'card.png' }] })
                .catch(err => msg.say(err));
        } catch (err) {
            return msg.say('An Error Occurred while creating the image. ' + err);
        }
    }
};
