// Dependencies
import { CommandInteraction, MessageEmbed, Permissions } from "discord.js";

// Configurations
import getEmbedConfig from "@helpers/getEmbedConfig";

// Handlers
import logger from "@logger";

// Helpers

// Models
import fetchUser from "@helpers/fetchUser";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

// Function
export default {
  metadata: {
    guildOnly: true,
    ephemeral: true,
    permissions: [Permissions.FLAGS.MANAGE_GUILD],
  },

  builder: (command: SlashCommandSubcommandBuilder) => {
    return command
      .setName("set")
      .setDescription("Set the amount of credits a user has.")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to set the amount of credits for.")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription(`The amount of credits to set.`)
          .setRequired(true)
      );
  },
  execute: async (interaction: CommandInteraction) => {
    if (interaction.guild == null) return;
    const { errorColor, successColor, footerText, footerIcon } =
      await getEmbedConfig(interaction.guild);
    const { options, guild } = interaction;

    const discordUser = options.getUser("user");
    const creditAmount = options.getInteger("amount");

    // If amount is null
    if (creditAmount === null) {
      logger?.silly(`Amount is null`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Set)")
            .setDescription(`You must provide an amount.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    if (discordUser === null) {
      logger?.silly(`User is null`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Set)")
            .setDescription(`You must provide a user.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }
    if (guild === null) {
      logger?.silly(`Guild is null`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Set)")
            .setDescription(`You must provide a guild.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // toUser Information
    const toUser = await fetchUser(discordUser, guild);

    // If toUser does not exist
    if (toUser === null) {
      logger?.silly(`User does not exist`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Set)")
            .setDescription(`The user you provided does not exist.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // If toUser.credits does not exist
    if (toUser?.credits === null) {
      logger?.silly(`User does not have any credits`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Set)")
            .setDescription(`The user you provided does not have any credits.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // Set toUser with amount
    toUser.credits = creditAmount;

    // Save toUser
    await toUser?.save()?.then(async () => {
      logger?.silly(`Saved user`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Set)")
            .setDescription(
              `Set **${discordUser}**'s credits to **${creditAmount}**.`
            )
            .setTimestamp(new Date())
            .setColor(successColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    });
  },
};
