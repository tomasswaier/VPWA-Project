<template>

  <q-layout view="lHh Lpr lFf">
    <q-header elevated >
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Chat Appus </q-toolbar-title>

        <q-btn class="" to="/login" flat dense round icon="login" aria-label="Meow" />
        <q-btn class="" flat dense round icon="logout" aria-label=""  />
        <q-btn class="" flat dense round icon="person" aria-label=""  />

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in groupLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
        <div class="q-pa-md row justify-center">
          <div id="spravySem" style="width: 100%;">
            <!--<q-infinite-scroll  :offset="250">-->
              <q-chat-message
                name="me"
                :text="['Hi missy how are you doing']"
                sent
              />
              <q-chat-message
                name="Johnka"
                :text="['doing fine, how r you?']"
              />
              <q-chat-message
                name="Johnka"
                :text="['are you okay?']"
              />
              <q-chat-message
                name="me"
                :text="['Not so good. My right hand died literally as Im writing this message']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['From here on our messages will be cat ipsum']"
                sent
              />
              <q-chat-message
                name="me"
                sent
              />
              <q-chat-message
                name="Johnka"
                :text="['Yowling nonstop the whole night vommit food and eat it again. Stare out the window thinking longingly about tuna brine sit in box so ignore the squirrels, youll never catch them anyway. Flee in terror at cucumber discovered on floor licks paws but jump on fridge purr. Snuggles up to shoulders or knees and purrs you to sleep leave hair everywhere, or miaow then turn around and show you my bum naughty running cat and run off table persian cat jump eat fish. Walk on car leaving trail of paw prints on hood and windshield favor packaging over toy and good now the other hand, too or pet my belly, you know you want to; seize the hand and shred it! cat dog hate mouse eat string barf pillow no baths hate everything chirp at birds. Hey! you there, with the hands.']"
              />
              <q-chat-message
                name="Marian Emanual Chornandez Pelko De la Muerto"
                :text="['Sit on the laptop. Cats are fats i like to pets them they like to meow back ha ha, youre funny ill kill you last, and kitty run to human with blood on mouth from frenzied attack on poor innocent mouse, dont i look cute? let me in let me out let me in let me out let me in let me out who broke this door anyway or destroy couch, and chase little red dot someday it will be mine!, or use lap as chair']"
              />
              <q-chat-message
                name="me"
                :text="['Morning beauty routine of licking self cough furball into food bowl then scratch owner for a new one for kitty kitty pussy cat doll i is playing on your console hooman and purr as loud as possible, be the most annoying cat that you can, and, knock everything off the table meow meow we are 3 small kittens sleeping most of our time, we are around 15 weeks old i think,']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['Spread kitty litter all over house sniff other cats butt and hang jaw half open thereafter and cat fur is the new black stinky cat pet me pet me pet me pet me, bite, scratch, why are you petting me. Sleep on my humans head eat an easter feather as if it were a bird then burp victoriously, but tender for so youre just gonna scroll by without saying meowdy?.']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['Pushed the mug off the table. The dog smells bad destroy house in 5 seconds, yet cough hairball on conveniently placed pants and grab pompom in mouth and put in water dish but love me!. I will ruin the couch with my claws catch mouse and gave it as a present but cats are a queer kind of folk. Step on your keyboard while youre gaming and then turn in a circle meowzer but love fish lie in the sink all day']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['Ooooh feather moving feather! scratch me there, elevator butt for scratch but look at dog hiiiiiisssss. Flop over milk the cow and howl on top of tall thing. Pee on walls it smells like breakfast climb into cupboard and lick the salt off rice cakes for head nudges human is in bath tub, emergency! drowning! meooowww! so need to chase tail. Cat walks in keyboard kitty scratches couch bad kitty.']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['Destroy couch cats woo. Destroy the blinds nya nya nyan check cat door for ambush 10 times before coming in, for chew iPad power cord, and present belly, scratch hand when stroked. Catch small lizards, bring them into house, then unable to find them on carpet meow meow mama kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff so use lap as chair, and murf pratt ungow ungow. Leave fur on owners clothes my cat stared at me he was sipping his tea, too, or sit in window and stare oooh, a bird, yum so roll on the floor purring your whiskers off why cant i catch that stupid red dot need to chase tail.']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['If it smells like fish eat as much as you wish unwrap toilet paper but stretch out on bed cat slap dog in face cat dog hate mouse eat string barf pillow no baths hate everything but lick the other cats. Destroy house in 5 seconds cat snacks, and meow and walk away. do not try to mix old food with new one to fool me!']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['Hit you unexpectedly scratch me there, elevator butt human is in bath tub, emergency! drowning! meooowww! but attack feet. Nyan fluffness ahh cucumber! theres a forty year old lady there let us feast refuse to leave cardboard box eat too much then proceed to regurgitate all over living room carpet while humans eat dinner but its 3am, time to create some chaos for knock over christmas tree. Meow go back to sleep owner brings food and water tries to pet on head, so scratch get sprayed by water because bad cat steal moms crouton while she is in the bathroom. Eat half my food and ask for more put toy mouse in food bowl run out of litter box at full speed . Small kitty warm kitty little balls of fur good morning sunshine, all of a sudden cat goes crazy, pushes butt to face. I can haz i love cats i am one wake up scratch humans leg for food then purr then i have a and relax lick plastic bags but why use post when this sofa is here scratch the box so eat a plant, kill a hand yet wack the mini furry mouse.']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['imma cat meow meow meow']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['imma cat meow meow meow']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['imma cat meow meow meow']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['imma cat meow meow meow']"
                sent
              />
              <q-chat-message
                name="me"
                :text="['imma cat meow meow meow']"
                sent
              />
                <!--</q-infinite-scroll>-->

          </div>
        </div>
<q-input rounded outlined v-model="text" class="relative-position" label="Rounded outlined" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const groupLinks: EssentialLinkProps[] = [
  {
    title: 'Group#1',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  },
  {
    title: 'SuperGroup',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  },
  {
    title: 'Minecraft Group',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  },
  {
    title: 'Nazi group',
    caption: 'Gooner group',
    link: 'https://quasar.dev',
  }
];

const text = ref('');

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
