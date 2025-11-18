import { Notify } from "quasar";
import { reactive, ref } from "vue";

import { api } from "../boot/axios";

// Interface pre správy
interface Message {
  text: string;
  sender: string;
  isHighlighted: boolean;
}

const messages = ref<Message[]>([
  { text: "Some normal message", sender: "Johnka", isHighlighted: false },
  {
    text: "@TomáškoTruman hey check this!",
    sender: "Johnka",
    isHighlighted: true,
  },
  { text: "Another message", sender: "Emanuel", isHighlighted: false },
]);

const text = ref("");
const currentlyPeekedMessage = ref("");

// skupinové konštanty
const currentGroupName = ref("Trumans Group");
const displayedMembers = ref<Array<{ name: string; avatar: string }>>([]);
const publicGroups = ref<Array<{ name: string; caption: string }>>([]);

interface TypingUser {
  name: string;
  message: string;
}

const typingUsers = ref<TypingUser[]>([
  { name: "Johnka", message: "I have yet to introduce myself moew moew moe w" },
  {
    name: "Emanuel",
    message:
      "Ja som Emanuel Emanuel som ja a ja ak budem Emanuel tak budem Emanuel",
  },
]);

interface GroupLinkProps {
  title: string;
  caption?: string;
  link?: string;
  isPrivate?: boolean;
  isOwner?: boolean;
  isInvite?: boolean;
}

interface Dialogs {
  groupLeave: boolean;
  groupList: boolean;
  groupCreate: boolean;
  groupDelete: boolean;
  groupInvite: boolean;
  groupUserList: boolean;
  userKick: boolean;
  userRevoke: boolean;
  userMessagePeek: boolean;
}
const dialogs: Dialogs = reactive({
  groupLeave: false,
  groupList: false,
  groupCreate: false,
  groupDelete: false,
  groupInvite: false,
  groupUserList: false,
  userKick: false,
  userRevoke: false,
  userMessagePeek: false,
});

const groupLinks: GroupLinkProps[] = [
  {
    title: "Group#1",
    caption: "Gaming group",
    link: "",
    isPrivate: true,
  },
  {
    title: "SuperGroup",
    caption: "Omega good groupgroup",
    link: "",
    isOwner: true,
  },
  {
    title: "Minecraft Group",
    caption: "group for minecraft fans",
    link: "",
    isPrivate: true,
  },
  {
    title: "Disabled group",
    caption: "play game disabled",
    link: "",
    isInvite: true,
  },
  {
    title: "Chat group ",
    caption: "",
    link: "",
    isOwner: true,
  },
  {
    title: "League of lengeds Group",
    caption: "group for league fans",
    link: "",
    isPrivate: true,
  },
  {
    title: "group Group",
    caption: "group for group",
    link: "",
    isPrivate: true,
    isInvite: true,
  },
  {
    title: "SuperGroupGroup",
    caption: "Omega good groupgroupgrougroup",
    link: "",
    isPrivate: true,
    isOwner: true,
  },
  {
    title: "Minecraft Group pvp",
    caption: "group for minecraft pvp fans",
    link: "",
    isPrivate: true,
  },
  {
    title: "groupgrougroup",
    caption: "group for people who groupgroup",
    link: "",
    isInvite: true,
  },
  {
    title: "League group aram",
    caption: "aram group group",
    link: "",
    isOwner: true,
  },
  {
    title: "Minecraft Group skyublock",
    caption: "group for minecraft skyblock fans",
    link: "",
    isPrivate: true,
  },
  {
    title: "CoolChatgroup",
    caption: "group for people who are cool",
    link: "",
    isInvite: true,
  },
  {
    title: "Meow Cats Meow",
    caption: "Meow moew meow",
    link: "",
    isOwner: true,
  },
  {
    title: "Minecraft Cats group",
    caption: "group for minecraft cat fans",
    link: "",
    isPrivate: true,
  },
  {
    title: "Disabled group",
    caption: "group for people play game disabled",
    link: "",
    isInvite: true,
  },
  {
    title: "SuperGroup",
    caption: "Omega good groupgroup",
    link: "",
    isOwner: true,
  },
  {
    title: "Minecraft hate Group  ",
    caption: "group for minecraft fans",
    link: "",
    isPrivate: true,
  },
  {
    title: "not Disabled group",
    caption: "we hate game disabled",
    link: "",
    isInvite: true,
  },
  {
    title: "penguin gruop",
    caption: "pengu",
    link: "",
    isOwner: true,
    isPrivate: true,
  },
  {
    title: "baseball",
    caption: "baseball fans",
    link: "",
    isPrivate: true,
  },
  {
    title: "Disabled group",
    caption: "we play game disabled",
    link: "",
  },
];

// Zoznam base memberov
const baseMemberTemplates = [
  { name: "Johnka", avatar: "https://cdn.quasar.dev/img/avatar2.jpg" },
  {
    name: "Marian Emanual Chornandez Pelko De La Muerto",
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  { name: "Tomas Truman", avatar: "https://cdn.quasar.dev/img/avatar4.jpg" },
];

const baseGroupTemplates = [
  {
    name: "Anima Group",
    caption: "here we talk about animals and other fun stuff",
  },
  { name: "Fun Group XD", caption: "we have fun here!" },
  {
    name: "Leauge of legends",
    caption: "HERE WE TALK ABOUT LEAGUE OF LEGENDS",
  },
  { name: "GAMING", caption: "HERE WE TALK ABOUT GAMES!!" },
  { name: "Fashion", caption: "let's discuss fashion!!" },
];

function loadGroupMembers(index: number, done: () => void): void {
  setTimeout(() => {
    const batchSize = 5;
    const newMembers = [];

    for (let i = 0; i < batchSize; i++) {
      const templateIX = (displayedMembers.value.length + i) %
        baseMemberTemplates.length;
      const template = baseMemberTemplates[templateIX]!;

      // pri kazdom znovunačítaní som pridal číslo, nech vidno, že sú to
      // "nový" členovia skupiny
      newMembers.push({
        name: `${template.name} #${displayedMembers.value.length + i + 1}`,
        avatar: template.avatar,
      });
    }

    displayedMembers.value.push(...newMembers);
    done();
  }, 300);
}

function loadPublicGroups(index: number, done: () => void): void {
  setTimeout(() => {
    const batchSize = 10;
    const newGroups = [];

    for (let i = 0; i < batchSize; i++) {
      const templateIX = (publicGroups.value.length + i) %
        baseGroupTemplates.length;
      const template = baseGroupTemplates[templateIX]!;

      newGroups.push({
        name: `${template.name} #${publicGroups.value.length + i + 1}`,
        caption: template.caption,
      });
    }

    publicGroups.value.push(...newGroups);
    done();
  }, 300);
}

function sortGroupLinksByInvites(groupLinks: GroupLinkProps[]) {
  let firstAvailablePosition = 0;
  let walkingPointer = 0;
  while (walkingPointer < groupLinks.length) {
    if (groupLinks[walkingPointer]?.isInvite) {
      const temp: GroupLinkProps = groupLinks[firstAvailablePosition]!;
      groupLinks[firstAvailablePosition] = groupLinks[walkingPointer]!;
      groupLinks[walkingPointer] = temp;
      firstAvailablePosition++;
    }
    walkingPointer++;
  }
}

function resetGroupMembers(): void {
  displayedMembers.value = [];
}

function loadMessages(index: number, done: () => void): void {
  messages.value.splice(0, 0, { text: "", sender: "me", isHighlighted: false });
  done();
}

async function sendMessage() {
  const inputText: string = text.value.trim();
  if (inputText) {
    const firstArg: string = inputText.split(" ")[0] as string;
    switch (firstArg) {
      case "/cancel":
        leaveGroup();
        break;
      case "/invite":
        inviteGroup();
        break;
      case "/list":
        listGroupUsers();
        break;
      case "/join":
        joinGroup();
        break;
      case "/delete":
        deleteGroup();
        break;
      case "/revoke":
        revokeUser();
        break;
      case "/kick":
        kickUser();
        break;
      case "/test":
        await test();
        break;
      default: // Kontrola či správa obsahuje @mention
      {
        const containsMention = inputText.includes("@");
        messages.value.push(
          { text: inputText, sender: "me", isHighlighted: containsMention },
        );
        console.log("Message sent:", text.value);
        break;
      }
    }
    text.value = "";
  }
}
async function test() {
  const response = await api.get("/test");
  console.log(response);
}
function listGroupUsers() {
  resetGroupMembers();
  dialogs.groupUserList = true;
}

function listGroups() {
  dialogs.groupList = true;
}

function joinGroup() {
  dialogs.groupCreate = true;
}
function leaveGroup() {
  dialogs.groupLeave = true;
}
function deleteGroup() {
  dialogs.groupDelete = true;
}

function inviteGroup() {
  dialogs.groupInvite = true;
}
function openDialog(user: TypingUser) {
  currentlyPeekedMessage.value = user.message;
  dialogs.userMessagePeek = true;
}

export type { Dialogs, GroupLinkProps, Message, TypingUser };

function kickUser() {
  dialogs.userKick = true;
}
function revokeUser() {
  dialogs.userRevoke = true;
}

export {
  currentGroupName,
  currentlyPeekedMessage,
  deleteGroup,
  dialogs,
  displayedMembers,
  groupLinks,
  inviteGroup,
  joinGroup,
  leaveGroup,
  listGroups,
  loadGroupMembers,
  loadMessages,
  loadPublicGroups,
  messages,
  openDialog,
  publicGroups,
  resetGroupMembers,
  sendMessage,
  sortGroupLinksByInvites,
  text,
  typingUsers,
};

function simulateIncomingInvite(userName: string, groupName: string) {
  Notify.create({
    message: `${userName} has invited you to ${groupName}`,
    color: "primary",
    icon: "group_add",
    position: "top-right",
    timeout: 5000,
    actions: [
      {
        label: "Accept",
        color: "white",
        handler: () => {
          Notify.create({
            message: `You joined ${groupName}!`,
            color: "positive",
            icon: "check_circle",
            position: "top",
            timeout: 2000,
          });
        },
      },
      {
        label: "Decline",
        color: "white",
        handler: () => {
          Notify.create({
            message: "Invitation declined",
            color: "red",
            icon: "cancel",
            position: "top",
            timeout: 2000,
          });
        },
      },
    ],
  });
}

export { simulateIncomingInvite };
// simulateIncomingInvite('Tomas Truman', 'Gaming Group')
