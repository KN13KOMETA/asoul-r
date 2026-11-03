// SPDX-FileCopyrightText: 2023-2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} from "discord.js";
import { ICommand } from "./types/ICommand.js";
import { EClient } from "./types/EClient.js";
import { readdir } from "fs";
import path from "path";
import config from "./config.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as EClient;

client.cmdList = new Collection();
client.btnList = new Collection();
client.sltList = new Collection();

client.once(Events.ClientReady, () => {
  if (!client.user) throw new Error(`"Client.user" is empty.`);
  console.log("Online as " + client.user.tag);
  let iStat = 0;

  const statusFun = () => {
    // !Useless return but ts returns error
    if (!client.user) return;
    client.user.setActivity(config.get("discord.bot.status.list")[iStat++]);
    if (iStat == config.get("discord.bot.status.list").length) iStat = 0;
  };

  if (!config.get("discord.bot.status.list").length) return;
  statusFun();
  setInterval(statusFun, config.get("discord.bot.status.interval") * 1000);
});

// Handling interactions
client.on(Events.InteractionCreate, async (inter) => {
  // TODO: Check if able to send message
  if (inter.isChatInputCommand()) {
    const fun = client.cmdList.get(inter.commandName);
    if (!fun) return;
    try {
      await fun(inter);
    } catch (e) {
      console.log(`Error at command "${inter.commandName}"`);
      console.log(e);
    }
  } else if (inter.isButton()) {
    const [cmd, act] = inter.customId.split("@");
    const btnFun = client.btnList.get(cmd);
    if (!btnFun) return;
    try {
      await btnFun({ act, inter });
    } catch (e) {
      console.log(`Error at button "${inter.customId}", e:${e}`);
    }
  } else if (inter.isStringSelectMenu()) {
    const sltFun = client.sltList.get(inter.customId);
    if (!sltFun) return;
    try {
      await sltFun(inter);
    } catch (e) {
      console.log(`Error at string select menu "${inter.customId}", e:${e}`);
    }
  }
});

// Setting up commands and their buttons
readdir(path.join(import.meta.dirname, "cmd"), "utf-8", async (e, fileList) => {
  if (e) throw e;
  const restBody = [];
  for (let file of fileList) {
    if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;
    if (file.includes("coa")) continue;
    const commandModule = await import(
      path.join(import.meta.dirname, "cmd", file)
    );
    const cmd: ICommand = commandModule.default || commandModule;
    file = file.slice(0, -3);
    restBody.push(cmd.data.toJSON());
    client.cmdList.set(file, cmd.fun);
    if (cmd.btnFun) client.btnList.set(file, cmd.btnFun);
    if (cmd.sltFun) client.sltList.set(file, cmd.sltFun);
  }

  console.log(`Found ${client.cmdList.size} commands:
${[...client.cmdList.keys()].map((v) => "  " + v).join("\n")}`);

  // Sending commands to discord to add it
  new REST({ version: "10" })
    .setToken(config.get("discord.bot.token"))
    .put(Routes.applicationCommands(config.get("discord.applicationID")), {
      body: restBody,
    });
});

client.login(config.get("discord.bot.token"));
