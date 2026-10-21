// ==UserScript==
// @name         PIO AutoDex — Dudu
// @namespace    https://github.com/panicguy/Scripts-PIO
// @version      0.2.6
// @description  AutoDex: nomes reais, fila de Pokédex, caça e retorno agendado ao Centro Pokémon.
// @author       Dudu
// @match        https://pokeidle.io/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js
// @downloadURL  https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js
// ==/UserScript==
(() => {
  'use strict';
  if (window.__PIO_AUTODEX__) return;
  window.__PIO_AUTODEX__ = true;

  const SAVE_KEY = 'pio-autodex-v021'; // Preserva a fila e o progresso da v0.2.1.
  const el = (query, root = document) => root.querySelector(query);
  const many = (query, root = document) => Array.from(root.querySelectorAll(query));
  const label = node => (node?.textContent || '').replace(/\s+/g, ' ').trim();
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const byId = new Map();
  // Catálogo de 1247 espécies fornecido pelo próprio jogador. Serve para nomes
  // que a Pokédex oculta como "???"; o estado PEGO/VISTO é sempre lido do jogo.
  const catalogRaw = "1~1~Bulbasaur|2~1~Ivysaur|3~1~Venusaur|4~1~Charmander|5~1~Charmeleon|6~1~Charizard|7~1~Squirtle|8~1~Wartortle|9~1~Blastoise|10~1~Caterpie|11~1~Metapod|12~1~Butterfree|13~1~Weedle|14~1~Kakuna|15~1~Beedrill|16~1~Pidgey|17~1~Pidgeotto|18~1~Pidgeot|19~1~Rattata|20~1~Raticate|21~1~Spearow|22~1~Fearow|23~1~Ekans|24~1~Arbok|25~1~Pikachu|26~1~Raichu|27~1~Sandshrew|28~1~Sandslash|29~1~Nidoran Female|30~1~Nidorina|31~1~Nidoqueen|32~1~Nidoran Male|33~1~Nidorino|34~1~Nidoking|35~1~Clefairy|36~1~Clefable|37~1~Vulpix|38~1~Ninetales|39~1~Jigglypuff|40~1~Wigglytuff|41~1~Zubat|42~1~Golbat|43~1~Oddish|44~1~Gloom|45~1~Vileplume|46~1~Paras|47~1~Parasect|48~1~Venonat|49~1~Venomoth|50~1~Diglett|51~1~Dugtrio|52~1~Meowth|53~1~Persian|54~1~Psyduck|55~1~Golduck|56~1~Mankey|57~1~Primeape|58~1~Growlithe|59~1~Arcanine|60~1~Poliwag|61~1~Poliwhirl|62~1~Poliwrath|63~1~Abra|64~1~Kadabra|65~1~Alakazam|66~1~Machop|67~1~Machoke|68~1~Machamp|69~1~Bellsprout|70~1~Weepinbell|71~1~Victreebel|72~1~Tentacool|73~1~Tentacruel|74~1~Geodude|75~1~Graveler|76~1~Golem|77~1~Ponyta|78~1~Rapidash|79~1~Slowpoke|80~1~Slowbro|81~1~Magnemite|82~1~Magneton|83~1~Farfetchd|84~1~Doduo|85~1~Dodrio|86~1~Seel|87~1~Dewgong|88~1~Grimer|89~1~Muk|90~1~Shellder|91~1~Cloyster|92~1~Gastly|93~1~Haunter|94~1~Gengar|95~1~Onix|96~1~Drowzee|97~1~Hypno|98~1~Krabby|99~1~Kingler|100~1~Voltorb|101~1~Electrode|102~1~Exeggcute|103~1~Exeggutor|104~1~Cubone|105~1~Marowak|106~1~Hitmonlee|107~1~Hitmonchan|108~1~Lickitung|109~1~Koffing|110~1~Weezing|111~1~Rhyhorn|112~1~Rhydon|113~1~Chansey|114~1~Tangela|115~1~Kangaskhan|116~1~Horsea|117~1~Seadra|118~1~Goldeen|119~1~Seaking|120~1~Staryu|121~1~Starmie|122~1~Mr. Mime|123~1~Scyther|124~1~Jynx|125~1~Electabuzz|126~1~Magmar|127~1~Pinsir|128~1~Tauros|129~1~Magikarp|130~1~Gyarados|131~1~Lapras|132~1~Ditto|133~1~Eevee|134~1~Vaporeon|135~1~Jolteon|136~1~Flareon|137~1~Porygon|138~1~Omanyte|139~1~Omastar|140~1~Kabuto|141~1~Kabutops|142~1~Aerodactyl|143~1~Snorlax|144~0~Articuno|145~0~Zapdos|146~0~Moltres|147~1~Dratini|148~1~Dragonair|149~1~Dragonite|150~0~Mewtwo|151~0~Mew|152~1~Chikorita|153~1~Bayleef|154~0~Meganium|155~1~Cyndaquil|156~1~Quilava|157~1~Typhlosion|158~1~Totodile|159~1~Croconaw|160~1~Feraligatr|161~1~Sentret|162~1~Furret|163~1~Hoothoot|164~1~Noctowl|165~1~Ledyba|166~1~Ledian|167~1~Spinarak|168~1~Ariados|169~1~Crobat|170~1~Chinchou|171~1~Lanturn|172~1~Pichu|173~1~Cleffa|174~1~Igglybuff|175~1~Togepi|176~1~Togetic|177~1~Natu|178~1~Xatu|179~1~Mareep|180~1~Flaaffy|181~1~Ampharos|182~1~Bellossom|183~1~Marill|184~1~Azumarill|185~1~Sudowoodo|186~1~Politoed|187~1~Hoppip|188~1~Skiploom|189~1~Jumpluff|190~1~Aipom|191~1~Sunkern|192~1~Sunflora|193~1~Yanma|194~1~Wooper|195~1~Quagsire|196~1~Espeon|197~1~Umbreon|198~1~Murkrow|199~1~Slowking|200~1~Misdreavus|201~1~Unown|202~1~Wobbuffet|203~1~Girafarig|204~1~Pineco|205~1~Forretress|206~1~Dunsparce|207~1~Gligar|208~1~Steelix|209~1~Snubbull|210~1~Granbull|211~1~Qwilfish|212~1~Scizor|213~1~Shuckle|214~1~Heracross|215~1~Sneasel|216~1~Teddiursa|217~1~Ursaring|218~1~Slugma|219~1~Magcargo|220~1~Swinub|221~1~Piloswine|222~1~Corsola|223~1~Remoraid|224~1~Octillery|225~1~Delibird|226~1~Mantine|227~1~Skarmory|228~1~Houndour|229~1~Houndoom|230~1~Kingdra|231~1~Phanpy|232~1~Donphan|233~1~Porygon2|234~1~Stantler|235~1~Smeargle|236~1~Tyrogue|237~1~Hitmontop|238~1~Smoochum|239~1~Elekid|240~1~Magby|241~1~Miltank|242~1~Blissey|243~0~Raikou|244~0~Entei|245~0~Suicune|246~1~Larvitar|247~1~Pupitar|248~1~Tyranitar|249~0~Lugia|250~0~Ho-oh|251~0~Celebi|252~1~Treecko|253~1~Grovyle|254~1~Sceptile|255~1~Torchic|256~1~Combusken|257~1~Blaziken|258~1~Mudkip|259~1~Marshtomp|260~1~Swampert|261~1~Poochyena|262~1~Mightyena|263~1~Zigzagoon|264~1~Linoone|265~1~Wurmple|266~1~Silcoon|267~1~Beautifly|268~1~Cascoon|269~1~Dustox|270~1~Lotad|271~1~Lombre|272~1~Ludicolo|273~1~Seedot|274~1~Nuzleaf|275~1~Shiftry|276~1~Taillow|277~1~Swellow|278~1~Wingull|279~1~Pelipper|280~1~Ralts|281~1~Kirlia|282~1~Gardevoir|283~1~Surskit|284~1~Masquerain|285~1~Shroomish|286~1~Breloom|287~1~Slakoth|288~1~Vigoroth|289~1~Slaking|290~1~Nincada|291~1~Ninjask|292~1~Shedinja|293~1~Whismur|294~1~Loudred|295~1~Exploud|296~1~Makuhita|297~1~Hariyama|298~1~Azurill|299~1~Nosepass|300~1~Skitty|301~1~Delcatty|302~1~Sableye|303~1~Mawile|304~1~Aron|305~1~Lairon|306~1~Aggron|307~1~Meditite|308~1~Medicham|309~1~Electrike|310~1~Manectric|311~1~Plusle|312~1~Minun|313~1~Volbeat|314~1~Illumise|315~1~Roselia|316~1~Gulpin|317~1~Swalot|318~1~Carvanha|319~1~Sharpedo|320~1~Wailmer|321~1~Wailord|322~1~Numel|323~1~Camerupt|324~1~Torkoal|325~1~Spoink|326~1~Grumpig|327~1~Spinda|328~1~Trapinch|329~1~Vibrava|330~1~Flygon|331~1~Cacnea|332~1~Cacturne|333~1~Swablu|334~1~Altaria|335~1~Zangoose|336~1~Seviper|337~1~Lunatone|338~1~Solrock|339~1~Barboach|340~1~Whiscash|341~1~Corphish|342~1~Crawdaunt|343~1~Baltoy|344~1~Claydol|345~1~Lileep|346~1~Cradily|347~1~Anorith|348~1~Armaldo|349~1~Feebas|350~1~Milotic|351~1~Castform|352~1~Kecleon|353~1~Shuppet|354~1~Banette|355~1~Duskull|356~1~Dusclops|357~1~Tropius|358~1~Chimecho|359~1~Absol|360~1~Wynaut|361~1~Snorunt|362~1~Glalie|363~1~Spheal|364~1~Sealeo|365~1~Walrein|366~1~Clamperl|367~1~Huntail|368~1~Gorebyss|369~1~Relicanth|370~1~Luvdisc|371~1~Bagon|372~1~Shelgon|373~1~Salamence|374~1~Beldum|375~1~Metang|376~1~Metagross|377~0~Regirock|378~0~Regice|379~0~Registeel|380~0~Latias|381~0~Latios|382~0~Kyogre|383~0~Groudon|384~0~Rayquaza|385~0~Jirachi|386~0~Deoxys|387~1~Turtwig|388~1~Grotle|389~1~Torterra|390~1~Chimchar|391~1~Monferno|392~1~Infernape|393~1~Piplup|394~1~Prinplup|395~1~Empoleon|396~1~Starly|397~1~Staravia|398~1~Staraptor|399~1~Bidoof|400~1~Bibarel|401~1~Kricketot|402~1~Kricketune|403~1~Shinx|404~1~Luxio|405~1~Luxray|406~1~Budew|407~1~Roserade|408~1~Cranidos|409~1~Rampardos|410~1~Shieldon|411~1~Bastiodon|412~1~Burmy|413~1~Wormadam|414~1~Mothim|415~1~Combee|416~1~Vespiquen|417~1~Pachirisu|418~1~Buizel|419~1~Floatzel|420~1~Cherubi|421~1~Cherrim|422~1~Shellos|423~1~Gastrodon|424~1~Ambipom|425~1~Drifloon|426~1~Drifblim|427~1~Buneary|428~1~Lopunny|429~1~Mismagius|430~1~Honchkrow|431~1~Glameow|432~1~Purugly|433~1~Chingling|434~1~Stunky|435~1~Skuntank|436~1~Bronzor|437~1~Bronzong|438~1~Bonsly|439~1~Mime Jr.|440~1~Happiny|441~1~Chatot|442~1~Spiritomb|443~1~Gible|444~1~Gabite|445~1~Garchomp|446~1~Munchlax|447~1~Riolu|448~1~Lucario|449~1~Hippopotas|450~1~Hippowdon|451~1~Skorupi|452~1~Drapion|453~1~Croagunk|454~1~Toxicroak|455~1~Carnivine|456~1~Finneon|457~1~Lumineon|458~1~Mantyke|459~1~Snover|460~1~Abomasnow|461~1~Weavile|462~1~Magnezone|463~1~Lickilicky|464~1~Rhyperior|465~1~Tangrowth|466~1~Electivire|467~1~Magmortar|468~1~Togekiss|469~0~Yanmega|470~1~Leafeon|471~1~Glaceon|472~1~Gliscor|473~1~Mamoswine|474~1~Porygon-Z|475~1~Gallade|476~1~Probopass|477~1~Dusknoir|478~1~Froslass|479~1~Rotom|480~0~Uxie|481~0~Mesprit|482~0~Azelf|483~0~Dialga|484~0~Palkia|485~0~Heatran|486~0~Regigigas|487~0~Giratina|488~0~Cresselia|489~0~Phione|490~0~Manaphy|491~0~Darkrai|492~0~Shaymin|493~0~Arceus|494~0~Victini|495~1~Snivy|496~1~Servine|497~1~Serperior|498~1~Tepig|499~1~Pignite|500~1~Emboar|501~1~Oshawott|502~1~Dewott|503~1~Samurott|504~1~Patrat|505~1~Watchog|506~1~Lillipup|507~1~Herdier|508~1~Stoutland|509~1~Purrloin|510~1~Liepard|511~1~Pansage|512~1~Simisage|513~1~Pansear|514~1~Simisear|515~1~Panpour|516~1~Simipour|517~1~Munna|518~1~Musharna|519~1~Pidove|520~1~Tranquill|521~1~Unfezant|522~1~Blitzle|523~1~Zebstrika|524~1~Roggenrola|525~1~Boldore|526~1~Gigalith|527~1~Woobat|528~1~Swoobat|529~1~Drilbur|530~1~Excadrill|531~1~Audino|532~1~Timburr|533~1~Gurdurr|534~1~Conkeldurr|535~1~Tympole|536~1~Palpitoad|537~1~Seismitoad|538~1~Throh|539~1~Sawk|540~1~Sewaddle|541~1~Swadloon|542~1~Leavanny|543~1~Venipede|544~1~Whirlipede|545~1~Scolipede|546~1~Cottonee|547~1~Whimsicott|548~1~Petilil|549~1~Lilligant|550~1~Basculin|551~1~Sandile|552~1~Krokorok|553~1~Krookodile|554~1~Darumaka|556~1~Maractus|557~1~Dwebble|558~1~Crustle|559~1~Scraggy|560~1~Scrafty|561~1~Sigilyph|562~1~Yamask|563~1~Cofagrigus|564~1~Tirtouga|565~1~Carracosta|566~1~Archen|567~1~Archeops|568~1~Trubbish|569~1~Garbodor|570~1~Zorua|571~1~Zoroark|572~1~Minccino|573~1~Cinccino|574~1~Gothita|575~1~Gothorita|576~1~Gothitelle|577~1~Solosis|578~1~Duosion|579~1~Reuniclus|580~1~Ducklett|581~1~Swanna|582~1~Vanillite|583~1~Vanillish|584~1~Vanilluxe|585~1~Deerling|586~1~Sawsbuck|587~1~Emolga|588~1~Karrablast|589~1~Escavalier|590~1~Foongus|591~1~Amoonguss|592~1~Frillish|593~1~Jellicent|594~1~Alomomola|595~1~Joltik|596~1~Galvantula|597~1~Ferroseed|598~1~Ferrothorn|599~1~Klink|600~1~Klang|601~1~Klinklang|602~1~Tynamo|603~1~Eelektrik|604~1~Eelektross|605~1~Elgyem|606~1~Beheeyem|607~1~Litwick|608~1~Lampent|609~1~Chandelure|610~1~Axew|611~1~Fraxure|612~1~Haxorus|613~1~Cubchoo|614~1~Beartic|615~1~Cryogonal|616~1~Shelmet|617~1~Accelgor|618~1~Stunfisk|619~1~Mienfoo|620~1~Mienshao|621~1~Druddigon|622~1~Golett|623~1~Golurk|624~1~Pawniard|625~1~Bisharp|626~1~Bouffalant|627~1~Rufflet|628~1~Braviary|629~1~Vullaby|630~1~Mandibuzz|631~1~Heatmor|632~1~Durant|633~1~Deino|634~1~Zweilous|635~1~Hydreigon|636~1~Larvesta|637~1~Volcarona|638~0~Cobalion|639~0~Terrakion|640~0~Virizion|641~0~Tornadus|642~0~Thundurus|643~0~Reshiram|644~0~Zekrom|645~0~Landorus|646~0~Kyurem|647~0~Keldeo|648~0~Meloetta|649~0~Genesect|650~1~Chespin|651~1~Quilladin|652~1~Chesnaught|653~1~Fennekin|654~1~Braixen|655~1~Delphox|656~1~Froakie|657~1~Frogadier|658~1~Greninja|659~1~Bunnelby|660~1~Diggersby|661~1~Fletchling|662~1~Fletchinder|663~1~Talonflame|664~1~Scatterbug|665~1~Spewpa|666~1~Vivillon|667~1~Litleo|668~1~Pyroar|669~1~Flabebe|670~1~Floette|671~1~Florges|672~1~Skiddo|673~1~Gogoat|674~1~Pancham|675~1~Pangoro|676~1~Furfrou|677~1~Espurr|678~1~Meowstic|679~1~Honedge|680~1~Doublade|681~1~Aegislash|682~1~Spritzee|683~1~Aromatisse|684~1~Swirlix|685~1~Slurpuff|686~1~Inkay|687~1~Malamar|688~1~Binacle|689~1~Barbaracle|690~1~Skrelp|691~1~Dragalge|692~1~Clauncher|693~1~Clawitzer|694~1~Helioptile|695~1~Heliolisk|696~1~Tyrunt|697~1~Tyrantrum|698~1~Amaura|699~1~Aurorus|700~1~Sylveon|701~1~Hawlucha|702~1~Dedenne|703~1~Carbink|704~1~Goomy|705~1~Sliggoo|706~1~Goodra|707~1~Klefki|708~1~Phantump|709~1~Trevenant|710~1~Pumpkaboo|711~1~Gourgeist|712~1~Bergmite|713~1~Avalugg|714~1~Noibat|715~1~Noivern|716~0~Xerneas|717~0~Yveltal|718~0~Zygarde|719~0~Diancie|721~0~Volcanion|722~1~Rowlet|723~1~Dartrix|724~1~Decidueye|725~1~Litten|726~1~Torracat|727~1~Incineroar|728~1~Popplio|729~1~Brionne|730~1~Primarina|731~1~Pikipek|732~1~Trumbeak|733~1~Toucannon|734~1~Yungoos|735~1~Gumshoos|736~1~Grubbin|737~1~Charjabug|738~1~Vikavolt|739~1~Crabrawler|740~1~Crabominable|741~1~Oricorio|742~1~Cutiefly|743~1~Ribombee|744~1~Rockruff|745~1~Lycanroc|746~1~Wishiwashi|747~1~Mareanie|748~1~Toxapex|749~1~Mudbray|750~1~Mudsdale|751~1~Dewpider|752~1~Araquanid|753~1~Fomantis|754~1~Lurantis|755~1~Morelull|756~1~Shiinotic|757~1~Salandit|758~1~Salazzle|759~1~Stufful|760~1~Bewear|761~1~Bounsweet|762~1~Steenee|763~1~Tsareena|764~1~Comfey|766~1~Passimian|767~1~Wimpod|768~1~Golisopod|769~1~Sandygast|770~1~Palossand|771~1~Pyukumuku|772~1~Type: Null|773~1~Silvally|774~1~Minior|776~1~Turtonator|777~1~Togedemaru|778~1~Mimikyu|779~1~Bruxish|780~1~Drampa|781~1~Dhelmise|782~1~Jangmo-o|783~1~Hakamo-o|784~1~Kommo-o|785~0~Tapu Koko|786~0~Tapu Lele|787~0~Tapu Bulu|788~0~Tapu Fini|789~0~Cosmog|790~0~Cosmoem|791~0~Solgaleo|792~0~Lunala|793~0~Nihilego|794~0~Buzzwole|795~0~Pheromosa|796~0~Xurkitree|797~0~Celesteela|798~0~Kartana|799~0~Guzzlord|800~0~Necrozma|801~0~Magearna|802~0~Marshadow|803~0~Poipole|804~0~Naganadel|805~0~Stakataka|806~0~Blacephalon|807~0~Zeraora|808~0~Meltan|809~0~Melmetal|810~1~Grookey|811~1~Thwackey|812~1~Rillaboom|813~1~Scorbunny|814~1~Raboot|815~1~Cinderace|816~1~Sobble|817~1~Drizzile|818~1~Inteleon|819~1~Skwovet|820~1~Greedent|821~1~Rookidee|822~1~Corvisquire|823~1~Corviknight|824~1~Blipbug|825~1~Dottler|826~1~Orbeetle|827~1~Nickit|828~1~Thievul|829~1~Gossifleur|830~1~Eldegoss|831~1~Wooloo|832~1~Dubwool|833~1~Chewtle|834~1~Drednaw|835~1~Yamper|836~1~Boltund|837~1~Rolycoly|838~1~Carkol|839~1~Coalossal|840~1~Applin|841~1~Flapple|842~1~Appletun|843~1~Silicobra|844~1~Sandaconda|845~1~Cramorant|846~1~Arrokuda|847~1~Barraskewda|848~1~Toxel|849~1~Toxtricity|850~1~Sizzlipede|851~1~Centiskorch|852~1~Clobbopus|853~1~Grapploct|856~1~Hatenna|857~1~Hattrem|858~1~Hatterene|859~1~Impidimp|860~1~Morgrem|862~1~Obstagoon|863~1~Perrserker|864~1~Cursola|865~1~Sirfetch'd|866~1~Mr. Rime|867~1~Runerigus|868~1~Milcery|869~1~Alcremie|870~1~Falinks|871~1~Pincurchin|872~1~Snom|873~1~Frosmoth|875~1~Eiscue|876~1~Indeedee|877~1~Morpeko|878~1~Cufant|879~1~Copperajah|880~1~Dracozolt|881~1~Arctozolt|882~1~Dracovish|883~1~Arctovish|884~1~Duraludon|885~1~Dreepy|886~1~Drakloak|887~1~Dragapult|888~0~Zacian|889~0~Zamazenta|890~0~Eternatus|891~0~Kubfu|892~0~Urshifu|893~0~Zarude|894~0~Regieleki|895~0~Regidrago|896~0~Glastrier|897~0~Spectrier|898~0~Calyrex|899~1~Wyrdeer|900~1~Kleavor|901~1~Ursaluna|902~1~Basculegion|903~1~Sneasler|904~1~Overqwil|906~1~Sprigatito|907~1~Floragato|908~1~Meowscarada|909~1~Fuecoco|910~1~Crocalor|911~1~Skeledirge|912~1~Quaxly|913~1~Quaxwell|914~1~Quaquaval|915~1~Lechonk|916~1~Oinkologne|917~1~Tarountula|918~1~Spidops|919~1~Nymble|920~1~Lokix|921~1~Pawmi|922~1~Pawmo|923~1~Pawmot|924~1~Tandemaus|925~1~Maushold|926~1~Fidough|927~1~Dachsbun|928~1~Smoliv|929~1~Dolliv|930~1~Arboliva|931~1~Squawkabilly|932~1~Nacli|933~1~Naclstack|934~1~Garganacl|935~1~Charcadet|936~1~Armarouge|938~1~Tadbulb|939~1~Bellibolt|940~1~Wattrel|941~1~Kilowattrel|942~1~Maschiff|943~0~Mabosstiff|944~1~Shroodle|945~1~Grafaiai|946~1~Bramblin|947~1~Brambleghast|948~1~Toedscool|949~1~Toedscruel|950~1~Klawf|951~1~Capsakid|952~1~Scovillain|953~1~Rellor|954~1~Rabsca|955~1~Flittle|956~1~Espathra|957~1~Tinkatink|958~1~Tinkatuff|959~1~Tinkaton|960~1~Wiglett|961~1~Wugtrio|962~1~Bombirdier|963~1~Finizen|965~1~Varoom|966~1~Revavroom|967~1~Cyclizar|968~1~Orthworm|969~1~Glimmet|970~1~Glimmora|971~1~Greavard|972~1~Houndstone|973~1~Flamigo|974~1~Cetoddle|975~1~Cetitan|976~1~Veluza|977~1~Dondozo|978~1~Tatsugiri|979~1~Annihilape|980~1~Clodsire|981~1~Farigiraf|982~1~Dudunsparce|983~1~Kingambit|984~1~Great Tusk|985~1~Scream Tail|986~1~Brute Bonnet|987~1~Flutter Mane|988~1~Slither Wing|989~1~Sandy Shocks|990~1~Iron Treads|991~1~Iron Bundle|992~1~Iron Hands|993~1~Iron Jugulis|994~1~Iron Moth|995~1~Iron Thorns|996~1~Frigibax|997~1~Arctibax|998~1~Baxcalibur|999~1~Gimmighoul|1000~1~Gholdengo|1001~0~Wo-Chien|1002~0~Chien-Pao|1003~0~Ting-Lu|1004~0~Chi-Yu|1005~1~Roaring Moon|1006~1~Iron Valiant|1007~0~Koraidon|1008~0~Miraidon|1009~0~Walking Wake|1010~0~Iron Leaves|1011~1~Dipplin|1012~1~Poltchageist|1013~1~Sinistcha|1014~0~Okidogi|1015~0~Munkidori|1016~0~Fezandipiti|1017~0~Ogerpon|1018~1~Archaludon|1019~1~Hydrapple|1020~0~Gouging Fire|1021~0~Raging Bolt|1022~0~Iron Boulder|1023~0~Iron Crown|1024~0~Terapagos|1025~0~Pecharunt|2001~1~Brave Blastoise|2002~1~Tribal Feraligatr|2003~0~Ancient Meganium|2004~1~Brave Venusaur|2005~1~War Heracross|2006~1~Furious Scyther|2007~1~Enigmatic Girafarig|2008~1~Charged Raichu|2009~1~Furious Ampharos|2010~1~Magnetic Electabuzz|2011~1~Ancient Dragonair|2012~1~Evil Cloyster|2013~1~Freezing Dewgong|2014~1~Psy Jynx|2015~1~Heavy Piloswine|2016~1~Milch-Miltank|2017~1~Roll Donphan|2018~1~Furious Sandslash|2019~1~Hard Golem|2020~1~Brute Rhydon|2021~1~Brave Charizard|2022~1~Enraged Typhlosion|2023~1~Brave Nidoking|2024~1~Brave Nidoqueen|2025~1~Dark Crobat|2026~1~Trickmaster Gengar|2027~1~Banshee Misdreavus|2028~1~Taekwondo Hitmonchan|2029~1~Taekwondo Hitmonlee|2030~1~Taekwondo Hitmontop|2031~1~Brave Arcanine|2032~1~Furious Magmar|2033~1~Ancient Pupitar|2034~1~Brave Steelix|2035~1~Furious Wigglytuff|2036~1~Ancient Xatu|2037~1~Brave Alakazam|2038~1~Ancient Hypno|2039~1~Furious Gyarados|2040~1~Brave Mantine|2041~1~Ancient Pinsir|2042~1~Brave Clefable|2043~1~Ancient Granbull|2044~1~Furious Skarmory|2045~1~Brave Noctowl|2046~1~Furious Pidgeot|2047~1~Ancient Marowak|2048~1~Brave Tyranitar|2049~1~Brave Aerodactyl|2050~1~Furious Scizor|2051~1~Ancient Dragonite|2052~1~Furious Whimsicott|2053~1~Magma Magcargo|2054~1~Toxic Toxicroak|2055~1~Psy Exeggutor|2056~1~Banshee Mismagius|2057~1~Freezing Aurorus|2058~1~War Scrafty|3003~0~Mega Venusaur|3006~0~Mega Charizard Y|9006~0~Mega Charizard X|3009~0~Mega Blastoise|3015~0~Mega Beedrill|3018~0~Mega Pidgeot|3026~0~Mega Raichu Y|3036~0~Mega Clefable|3065~0~Mega Alakazam|3071~0~Mega Victreebel|3080~0~Mega Slowbro|3094~0~Mega Gengar|3115~0~Mega Kangaskhan|3121~0~Mega Starmie|3127~0~Mega Pinsir|3130~0~Mega Gyarados|3142~0~Mega Aerodactyl|3149~0~Mega Dragonite|3150~0~Mega Mewtwo Y|9150~0~Mega Mewtwo X|3154~0~Mega Meganium|3160~0~Mega Feraligatr|3181~0~Mega Ampharos|3208~0~Mega Steelix|3212~0~Mega Scizor|3214~0~Mega Heracross|3227~0~Mega Skarmory|3229~0~Mega Houndoom|3248~0~Mega Tyranitar|3254~0~Mega Sceptile|3257~0~Mega Blaziken|3260~0~Mega Swampert|3282~0~Mega Gardevoir|3302~0~Mega Sableye|3303~0~Mega Mawile|3306~0~Mega Aggron|3308~0~Mega Medicham|3310~0~Mega Manectric|3319~0~Mega Sharpedo|3323~0~Mega Camerupt|3334~0~Mega Altaria|3354~0~Mega Banette|3358~0~Mega Chimecho|3359~0~Mega Absol|3362~0~Mega Glalie|3376~0~Mega Metagross|3380~0~Mega Latias|3381~0~Mega Latios|3382~0~Primal Kyogre|3383~0~Primal Groudon|3384~0~Mega Rayquaza|3398~0~Mega Staraptor|3428~0~Mega Lopunny|3445~0~Mega Garchomp|3448~0~Mega Lucario|9448~0~Mega Lucario Z|3460~0~Mega Abomasnow|3475~0~Mega Gallade|3478~0~Mega Froslass|3485~0~Mega Heatran|3491~0~Mega Darkrai|3530~0~Mega Excadrill|3545~0~Mega Scolipede|3560~0~Mega Scrafty|3604~0~Mega Eelektross|3609~0~Mega Chandelure|3623~0~Mega Golurk|3652~0~Mega Chesnaught|3655~0~Mega Delphox|3658~0~Mega Greninja|3668~0~Mega Pyroar|3670~0~Mega Floette|3678~0~Mega Meowstic|3687~0~Mega Malamar|3689~0~Mega Barbaracle|3691~0~Mega Dragalge|3701~0~Mega Hawlucha|3718~0~Mega Zygarde|3719~0~Mega Diancie|3740~0~Mega Crabominable|3768~0~Mega Golisopod|3780~0~Mega Drampa|3801~0~Mega Magearna|3807~0~Mega Zeraora|3870~0~Mega Falinks|3978~0~Mega Tatsugiri|3998~0~Mega Baxcalibur|4019~1~Alolan Rattata|4020~1~Alolan Raticate|4026~1~Alolan Raichu|4027~1~Alolan Sandshrew|4028~1~Alolan Sandslash|4037~1~Alolan Vulpix|4038~1~Alolan Ninetales|4050~1~Alolan Diglett|4051~1~Alolan Dugtrio|4052~1~Alolan Meowth|4074~1~Alolan Geodude|4075~1~Alolan Graveler|4088~1~Alolan Grimer|4089~1~Alolan Muk|4103~1~Alolan Exeggutor|4105~1~Alolan Marowak|5052~1~Galarian Meowth|5077~1~Galarian Ponyta|5078~1~Galarian Rapidash|5079~1~Galarian Slowpoke|5080~1~Galarian Slowbro|5083~1~Galarian Farfetch'd|5110~1~Galarian Weezing|5122~1~Galarian Mr. Mime|5144~1~Galarian Articuno|5145~1~Galarian Zapdos|5146~1~Galarian Moltres|5199~1~Galarian Slowking|5222~1~Galarian Corsola|5263~1~Galarian Zigzagoon|5264~1~Galarian Linoone|5554~1~Galarian Darumaka|5555~1~Galarian Darmanitan|5562~1~Galarian Yamask|5618~1~Galarian Stunfisk|6058~1~Hisuian Growlithe|6059~1~Hisuian Arcanine|6100~1~Hisuian Voltorb|6101~1~Hisuian Electrode|6157~1~Hisuian Typhlosion|6211~1~Hisuian Qwilfish|6215~1~Hisuian Sneasel|6503~1~Hisuian Samurott|6549~1~Hisuian Lilligant|6570~1~Hisuian Zorua|6571~1~Hisuian Zoroark|6628~1~Hisuian Braviary|6705~1~Hisuian Sliggoo|6706~1~Hisuian Goodra|6713~1~Hisuian Avalugg|6724~1~Hisuian Decidueye|7128~1~Paldean Tauros|7194~1~Paldean Wooper|8128~1~Paldean Tauros Blaze|9128~1~Paldean Tauros Aqua|8351~1~Castform Rainy|9351~1~Castform Snowy|11351~1~Castform Sunny|8386~1~Deoxys Attack|9386~1~Deoxys Defense|11386~1~Deoxys Speed|8479~1~Heat Rotom|9479~1~Wash Rotom|11479~1~Frost Rotom|12479~1~Fan Rotom|1479~1~Mow Rotom|8641~1~Tornadus Therian|8642~1~Thundurus Therian|8645~1~Landorus Therian|8646~1~White Kyurem|8647~1~Keldeo Resolute|8681~1~Aegislash Blade|8718~1~Zygarde 10%|9718~1~Zygarde Complete|8720~1~Hoopa Unbound|8741~1~Oricorio Pom-Pom|9741~1~Oricorio Pa'u|11741~1~Oricorio Sensu|8745~1~Lycanroc Midnight|9745~1~Lycanroc Dusk|8746~1~Wishiwashi School|8774~1~Minior Core|8888~1~Zacian Crowned|8889~1~Zamazenta Crowned|8901~1~Bloodmoon Ursaluna|8902~1~Basculegion Female|8905~1~Enamorus Therian|8964~1~Palafin Hero";
  const catalog = new Map(catalogRaw.split('|').map(row => {
    const [id, normalHunt, name] = row.split('~');
    return [Number(id), { name, normalHunt: normalHunt === '1' }];
  }));

  // Classificação explicitamente marcada como LENDÁRIO / MÍTICO no catálogo
  // enviado pelo jogador, incluindo formas regionais, Mega e Ultra Beasts.
  // O nome exibido pelo jogo pode ser "LENDÁRIO ???" ou "MÍTICO ???".
  const excludedIds = new Set('144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,716,717,718,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,803,804,805,806,888,889,890,891,892,894,895,896,897,898,1001,1002,1003,1004,1007,1008,1009,1010,1014,1015,1016,1017,1020,1021,1022,1023,1024,3150,9150,3380,3381,3382,3383,3384,3485,3718,5144,5145,5146,8641,8642,8645,8646,8718,9718,8888,8889,8905,151,251,385,386,489,490,491,492,493,494,647,648,649,719,721,801,802,807,808,809,893,1025,3491,3719,3801,3807,8386,9386,11386,8647,8720'.split(',').map(Number));
  const isExcluded = (id, raw = '') =>
    excludedIds.has(Number(id)) || /\b(lendario|mitico)\b/.test(norm(raw));

  // Níveis do "Onde encontrar" registrados na base do jogo.
  // Quando o nível não é conhecido, a espécie fica após as de nível conhecido.
  const huntLevels = new Map('1:20,2:40,3:80,4:20,5:40,6:80,7:20,8:40,9:80,10:1,11:10,12:30,13:1,14:10,15:30,16:1,17:20,18:80,19:1,20:30,21:10,22:50,23:10,24:40,25:60,26:80,27:20,28:60,29:10,30:30,31:80,32:10,33:30,34:80,35:40,36:80,37:20,38:100,39:40,40:80,41:10,42:40,43:1,44:30,45:70,46:1,47:50,48:20,49:60,50:10,51:40,52:20,53:50,54:20,55:80,56:10,57:30,58:30,59:100,60:1,61:30,62:80,63:10,64:50,65:100,66:20,67:40,68:80,69:1,70:30,71:60,72:10,73:80,74:1,75:40,76:80,77:20,78:70,79:10,80:60,81:10,82:80,83:50,84:10,85:60,86:20,87:60,88:10,89:80,90:10,91:60,92:20,93:50,94:100,95:60,96:30,97:60,98:10,99:60,100:10,101:40,102:10,103:100,104:20,105:50,106:60,107:60,108:60,109:10,110:60,111:30,112:100,113:60,114:50,115:80,116:10,117:50,118:10,119:50,120:20,121:80,122:80,123:100,124:100,125:100,126:100,127:100,128:60,129:1,130:100,131:100,132:50,133:40,134:80,135:80,136:80,137:20,138:20,139:80,140:20,141:80,142:100,143:100,147:30,148:80,149:100,152:260,153:320,154:440,155:260,156:320,157:440,158:260,159:320,160:440,161:230,162:320,163:260,164:380,165:230,166:320,167:230,168:320,169:440,170:230,171:440,172:260,173:260,174:260,175:200,176:440,177:290,178:440,179:260,180:320,181:440,182:350,183:260,184:380,185:380,186:410,187:200,188:290,189:350,190:320,191:200,192:290,193:350,194:260,195:380,196:440,197:440,198:350,199:380,200:470,201:10,202:470,203:440,204:230,205:440,206:290,207:320,208:470,209:290,210:440,211:350,212:470,213:320,214:470,215:350,216:290,217:470,218:230,219:470,220:230,221:440,222:350,223:230,224:410,225:320,226:470,227:470,228:260,229:440,230:470,231:260,232:440,233:320,234:350,235:290,236:290,237:380,238:290,239:290,240:290,241:440,242:440,246:290,247:380,248:470,252:500,253:650,254:850,255:500,256:650,257:850,258:500,259:650,260:850,261:500,262:700,263:500,264:650,265:500,266:650,267:850,268:500,269:700,270:500,271:650,272:850,273:500,274:650,275:850,276:500,277:700,278:500,279:700,280:500,281:650,282:850,283:500,284:700,285:500,286:700,287:500,288:600,289:700,290:500,291:700,292:500,293:500,294:650,295:850,296:550,297:700,298:500,299:500,300:500,301:700,302:600,303:600,304:500,305:650,306:850,307:500,308:700,309:500,310:700,311:550,312:550,313:550,314:550,315:650,316:500,317:700,318:500,319:700,320:500,321:700,322:500,323:700,324:600,325:500,326:700,327:500,328:500,329:650,330:850,331:500,332:700,333:500,334:700,335:600,336:600,337:550,338:550,339:500,340:700,341:500,342:700,343:500,344:700,345:500,346:700,347:500,348:700,349:500,350:700,351:550,352:550,353:500,354:700,355:500,356:650,357:600,358:700,359:600,360:500,361:500,362:700,363:500,364:650,365:850,366:500,367:700,368:550,369:550,370:500,371:500,372:700,373:850,374:500,375:650,376:850,387:1000,388:1750,389:3500,390:1000,391:1750,392:3500,393:1000,394:1750,395:3500,396:1000,397:1750,398:3500,399:1000,400:2000,401:1000,402:2000,403:1000,404:1750,405:3500,406:1000,407:3500,408:1000,409:2000,410:1000,411:3000,412:1000,413:2000,414:1250,415:1000,416:3000,417:1500,418:1000,419:2000,420:1000,421:2000,422:1000,423:2000,424:1250,425:1000,426:2000,427:1000,428:3000,429:1250,430:1500,431:1000,432:2000,433:1000,434:1000,435:2000,436:1000,437:2000,438:1000,439:1000,440:1000,441:1250,442:1250,443:1000,444:1750,445:3500,446:1000,447:1000,448:2000,449:1000,450:2000,451:1000,452:2000,453:1000,454:2000,455:1250,456:1000,457:2000,458:1000,459:1000,460:2000,461:1500,462:1500,463:1500,464:3000,465:3000,466:3000,467:3000,468:1500,469:1500,470:1500,471:1500,472:1500,473:1500,474:1500,475:1500,476:2000,477:3000,478:1250,479:1250,495:5000,496:6400,497:8600,498:5000,499:6400,500:8600,501:5000,502:6400,503:8600,504:5000,505:6950,506:5000,507:6400,508:8600,509:5000,510:6950,511:5000,512:6950,513:5000,514:6950,515:5000,516:6950,517:5000,518:6950,519:5000,520:6400,521:8600,522:5000,523:6950,524:5000,525:6400,526:8600,527:5000,528:6950,529:5000,530:6950,531:5400,532:5000,533:6400,534:8600,535:5000,536:6400,537:8600,538:5000,539:5000,540:5000,541:6400,542:8600,543:5000,544:6400,545:8600,546:5000,547:6950,548:5000,549:6950,550:5000,551:5000,552:6400,553:8600,554:5000,555:6950,556:5400,557:5000,558:6950,559:5000,560:6950,561:5400,562:5000,563:6950,564:5000,565:6950,566:5000,567:8000,568:5000,569:6950,570:5000,571:6950,572:5000,573:6950,574:5000,575:6400,576:8600,577:5000,578:6400,579:8600,580:5000,581:6950,582:5000,583:6400,584:8600,585:5000,586:6950,587:5400,588:5000,589:6950,590:5000,591:6950,592:5000,593:6950,594:5400,595:5000,596:6950,597:5000,598:6950,599:5000,600:6400,601:8600,602:5000,603:6400,604:8600,605:5000,606:6950,607:5000,608:6400,609:8600,610:5000,611:6400,612:8600,613:5000,614:6950,615:5900,616:5000,617:6950,618:5400,619:5000,620:6950,621:5400,622:5000,623:6950,624:5000,625:6400,626:5400,627:5000,628:6950,629:5000,630:6950,631:5400,632:5400,633:5000,634:6400,635:8600,636:5000,637:6950,650:10000,651:14350,652:21200,653:10000,654:14350,655:21200,656:10000,657:14350,658:21200,659:10000,660:16000,661:10000,662:14350,663:21200,664:10000,665:14350,666:21200,667:10000,668:16000,669:10000,670:14350,671:21200,672:10000,673:16000,674:10000,675:20000,676:11250,677:10000,678:16000,679:10000,680:14350,681:16000,682:10000,683:16000,684:10000,685:16000,686:10000,687:16000,688:10000,689:16000,690:10000,691:20000,692:10000,693:16000,694:10000,695:16000,696:10000,697:16000,698:10000,699:16000,700:12750,701:12750,702:11250,703:12750,704:10000,705:14350,706:21200,707:11250,708:10000,709:16000,710:10000,711:16000,712:10000,713:16000,714:10000,715:16000,722:25000,723:28950,724:35150,725:25000,726:28950,727:35150,728:25000,729:28950,730:35150,731:25000,732:28950,733:35150,734:25000,735:30450,736:25000,737:28950,738:35150,739:25000,740:30450,741:26150,742:25000,743:30450,744:25000,745:30450,746:25000,747:25000,748:30450,749:25000,750:30450,751:25000,752:30450,753:25000,754:30450,755:25000,756:30450,757:25000,758:30450,759:25000,760:30450,761:25000,762:28950,763:35150,764:26150,766:26150,767:25000,768:30450,769:25000,770:30450,771:26150,774:26150,776:26150,777:26150,778:26150,779:26150,780:26150,781:27500,782:25000,783:28950,784:35150,810:40000,811:49650,812:64950,813:40000,814:49650,815:64950,816:40000,817:49650,818:64950,819:40000,820:53350,821:40000,822:49650,823:64950,824:40000,825:49650,826:64950,827:40000,828:53350,829:40000,830:53350,831:40000,832:53350,833:40000,834:53350,835:40000,836:53350,837:40000,838:49650,839:64950,840:40000,841:53350,842:42800,843:40000,844:53350,845:42800,846:40000,847:53350,848:40000,849:53350,850:40000,851:53350,852:40000,853:53350,854:40000,855:53350,856:40000,857:49650,858:64950,859:40000,860:49650,861:64950,862:64950,863:42800,864:46150,865:46150,866:46150,867:42800,868:40000,869:53350,870:42800,871:42800,872:40000,873:53350,875:42800,876:42800,877:42800,878:40000,879:53350,880:46150,881:46150,882:46150,883:46150,884:40000,885:40000,886:49650,887:64950,899:46150,900:46150,901:46150,902:53350,903:46150,904:46150,906:75000,907:108000,908:160300,909:75000,910:108000,911:160300,912:75000,913:108000,914:160300,915:75000,916:120550,917:75000,918:120550,919:75000,920:120550,921:75000,922:108000,923:160300,924:75000,925:120550,926:75000,927:120550,928:75000,929:108000,930:160300,931:84650,932:75000,933:108000,934:160300,935:75000,936:120550,938:75000,939:120550,940:75000,941:120550,942:75000,943:120550,944:75000,945:120550,946:75000,947:120550,948:75000,949:120550,950:84650,951:75000,952:120550,953:75000,954:120550,955:75000,956:120550,957:75000,958:108000,959:160300,960:75000,961:120550,962:84650,963:75000,964:120550,965:75000,966:120550,967:95950,968:84650,969:75000,970:120550,971:75000,972:120550,973:95950,974:75000,975:120550,976:84650,977:95950,978:84650,979:95950,980:84650,981:95950,982:95950,983:160300,984:95950,985:95950,986:95950,987:95950,988:95950,989:95950,990:95950,991:95950,992:95950,993:95950,994:95950,995:95950,996:75000,997:108000,998:160300,999:75000,1000:120550,1005:95950,1006:95950,1011:75000,1012:75000,1013:120550,1018:120550,1019:120550,1479:1250,2001:150,2002:150,2003:150,2004:150,2005:150,2006:150,2007:150,2008:150,2009:150,2010:150,2011:150,2012:150,2013:150,2014:150,2015:150,2016:150,2017:150,2018:150,2019:150,2020:150,2021:150,2022:150,2023:150,2024:150,2025:150,2026:150,2027:150,2028:150,2029:150,2030:150,2031:150,2032:150,2033:150,2034:150,2035:150,2036:150,2037:150,2038:150,2039:150,2040:150,2041:150,2042:150,2043:150,2044:150,2045:150,2046:150,2047:150,2048:150,2049:150,2050:150,2051:150,2052:150,2053:150,2054:150,2055:150,2056:150,2057:150,2058:150,4019:25000,4020:30450,4026:35150,4027:25000,4028:30450,4037:25000,4038:30450,4050:25000,4051:30450,4052:25000,4053:30450,4074:25000,4075:28950,4088:25000,4089:30450,4103:30450,4105:30450,5052:40000,5077:40000,5078:53350,5079:40000,5080:53350,5083:40000,5110:53350,5122:49650,5144:64950,5145:64950,5146:64950,5199:53350,5222:40000,5263:40000,5264:49650,5554:40000,5555:53350,5562:40000,5618:46150,6058:40000,6059:53350,6100:40000,6101:53350,6157:64950,6211:40000,6215:40000,6503:64950,6549:53350,6570:40000,6571:53350,6628:53350,6705:49650,6706:64950,6713:53350,6724:64950,7128:95950,7194:75000,8128:95950,8351:700,8386:850,8413:2000,8479:1250,8483:3500,8484:3500,8492:3500,8555:8600,8641:8600,8642:8600,8645:8600,8646:8600,8647:8600,8681:21200,8718:21200,8720:21200,8741:26150,8745:30450,8746:26150,8774:26150,8888:64950,8889:64950,8901:160300,8902:53350,8905:64950,8964:120550,9128:95950,9351:700,9386:850,9413:2000,9479:1250,9555:64950,9646:8600,9718:21200,9741:26150,9745:30450,11351:700,11386:850,11479:1250,11741:26150,12479:1250'.split(',').map(s => {
    const [id,level] = s.split(':').map(Number);
    return [id,level];
  }));
  const validMode = mode => mode === 'weekly' ? 'weekly' : 'dex';
  const validOrder = order => ['level','dex','random'].includes(order) ? order : 'level';
  function sortQueue(rows, order) {
    const copy = [...rows];
    if (order === 'random') {
      // Embaralha uma única vez ao criar a fila. Salva a ordem resultante.
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i],copy[j]] = [copy[j],copy[i]];
      }
    } else if (order === 'level') {
      copy.sort((a,b) => (huntLevels.get(a.id) ?? Infinity) -
        (huntLevels.get(b.id) ?? Infinity) || a.id-b.id);
    } else copy.sort((a,b) => a.id-b.id);
    return copy;
  }

  let persisted = {};
  try { persisted = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch (_) {}
  const state = Object.assign({
    queue: [], index: 0, captured: [], skipped: [], current: null,
    returnPending: null, running: false, paused: false,
    modePreference: 'dex', orderPreference: 'level', runMode: 'dex', runOrder: 'level'
  }, persisted, {
    running: false, paused: false, current: null, returnPending: null
  });
  if (!Array.isArray(state.queue)) state.queue = [];
  if (!Array.isArray(state.captured)) state.captured = [];
  if (!Array.isArray(state.skipped)) state.skipped = [];
  state.modePreference = validMode(state.modePreference);
  state.orderPreference = validOrder(state.orderPreference);
  state.runMode = validMode(state.runMode);
  state.runOrder = validOrder(state.runOrder);
  // Migra uma fila anterior sem perder a posição já percorrida.
  if (state.queue.length) {
    const previous = state.queue.slice(0, state.index).filter(x => !isExcluded(x.id, x.name));
    const future = state.queue.slice(state.index)
      .filter(x => !isExcluded(x.id, x.name));
    // Mantém o trecho já percorrido, mas corrige numericamente todas as próximas hunts.
    state.queue = [...previous, ...future];
    state.index = previous.length;
  }
  let dex = [];
  let synchronized = false;
  let busy = false;
  let polling = false;
  let notice = 'Clique em Sincronizar para carregar a Pokédex.';
  let noticeKind = 'info';
  let phase = 'idle';
  let currentBadge = null;
  let savedFocus = '';
  const sessionEvents = [];

  function log(event, extra = '') {
    const item = { time: new Date().toISOString(), event, extra };
    sessionEvents.push(item);
    if (sessionEvents.length > 120) sessionEvents.shift();
    console.info('[PIO AutoDex]', event, extra);
  }
  function store() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('[PIO AutoDex] Falha no armazenamento local', e); }
  }
  function say(str, kind = 'info') {
    if (notice === str && noticeKind === kind) return;
    notice = str; noticeKind = kind;
    log(str);
    render();
  }
  function pause(str) {
    state.paused = true;
    phase = 'paused';
    store();
    say(str, 'warning');
  }
  function menuDex() { return el('nav.menu-topo button[data-modal="pokedex"]'); }
  function hud() { return label(el('#hud-hunt')); }
  function isCenter() { return /^centro\s+pok[eé]mon\b|^pok[eé]mon\s+center\b/i.test(hud()); }
  function captureBadge() {
    const value = norm(label(menuDex()));
    const match = value.match(/pokedex\s+(\d+)/);
    return match ? Number(match[1]) : 0;
  }
  // O Hunt Analyser permanece disponível no modo economia.
  // O diagnóstico confirmou: #hunt-analyser e #hunt-analyser-corpo.
  function analyzerHunt() {
    const outer = label(el('#hunt-analyser'));
    const inner = label(el('#hunt-analyser-corpo'));
    let matched = outer.match(/HUNT\s+ANALYS(?:ER|ER|ISER|IZER)\s+(.{1,70}?)\s+Nv\s*\d+/i);
    if (!matched) matched = inner.match(/^(.{1,70}?)\s+Nv\s*\d+/i);
    return matched ? matched[1].trim() : '';
  }
  function targetEvidence(current) {
    if (!current || isCenter()) return null;
    const expected = [norm(current.name), norm((current.slug || '').replace(/-/g, ' '))]
      .filter(Boolean);
    const matches = value => {
      const actual = norm(value);
      return !!actual && expected.some(name => actual === name ||
        actual.startsWith(name + ' '));
    };
    // Não confundir localização com botões ou textos do log da batalha.
    const location = hud().split(/[·|]/)[0]
      .replace(/\s+(?:n[ií]vel|nv)\s*\d+.*$/i, '').trim();
    if (matches(location)) return 'HUD';
    // Quando a economia de bateria oculta/abrevia o HUD, usa o analyzer.
    if (matches(analyzerHunt())) return 'Hunt Analyser';
    return null;
  }

  function speciesFromCard(card) {
    const content = label(card);
    const found = content.match(/#\s*(\d+)\s*(.*)/);
    const id = Number(found?.[1] || card.dataset.especie || card.dataset.id);
    if (!id) return null;
    const mapped = catalog.get(id);
    const rawName = (found?.[2] || '').trim();
    const shown = rawName && !/\?/.test(rawName) ? rawName : null;
    const name = shown || mapped?.name || 'Pokémon #' + id;
    return {
      id, name, caught: card.classList.contains('pego'),
      seen: card.classList.contains('visto'),
      unknown: card.classList.contains('desconhecido'),
      normalHunt: mapped?.normalHunt ?? null
    };
  }

  // O filtro da Pokédex fica persistido quando a janela fecha. É preciso
  // liberar a busca ANTES de contar cards ou clicar na espécie seguinte.
  function dexSearchInput() {
    const inputs = many('input').filter(input => {
      if (input.closest('#pio-ad-panel')) return false; // Nunca apagar a busca do AutoDex.
      const type = (input.getAttribute('type') || 'text').toLowerCase();
      return type === 'text' || type === 'search';
    });
    const scored = inputs.map(input => {
      const id = String(input.id || '');
      const attrs = [input.getAttribute('placeholder'), input.getAttribute('aria-label'),
        input.getAttribute('name'), input.getAttribute('title')].filter(Boolean).join(' ');
      const context = input.parentElement?.closest(
        '[id*="pokedex" i],[class*="pokedex" i],[id*="dex" i],[class*="dex-" i]'
      );
      let score = 0;
      if (/pokedex|poked[eé]x|(?:^|[-_])dex(?:$|[-_])/.test(norm(id).replace(/\s/g,'-'))) score += 9;
      if (/busca|buscar|pesquis|search|procur|filtr/i.test(id)) score += 3;
      if (/busca|buscar|pesquis|search|procur|filtr/i.test(attrs)) score += 5;
      if (/pok[eé]mon|pokedex|dex/i.test(attrs)) score += 3;
      if (context) score += 3;
      return { input, score, inDex: !!context, description: id || attrs };
    }).filter(x => x.score >= 5);
    scored.sort((a,b) => b.score-a.score);
    return scored[0]?.input || null;
  }
  function dexSearchVisible() {
    const input = dexSearchInput();
    if (!input) return false;
    if (input.closest('[hidden]')) return false;
    return !!(input.getClientRects?.().length || input.offsetParent);
  }
  function clearDexSearch() {
    const input = dexSearchInput();
    if (!input || !input.value) return false;
    const previous = input.value;
    input.value = '';
    // O jogo atualiza os cards no evento input; change dá compatibilidade extra.
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    log('Busca da Pokédex limpa automaticamente', JSON.stringify({
      previous, field: input.id || input.getAttribute('placeholder') || '(sem id)'
    }));
    return true;
  }
  async function restoreDexCards() {
    const cleared = clearDexSearch();
    if (cleared) await wait(220); // Aguarda o filtro atualizar o DOM.
    return cleared;
  }

  function readDex() {
    const cards = many('.dex-card');
    if (cards.length < 800) return false; // Nunca sincronizar lista reduzida por filtros.
    const parsed = cards.map(card => ({ card, species: speciesFromCard(card) }))
      .filter(entry => entry.species && !isExcluded(entry.species.id, label(entry.card)))
      .map(entry => entry.species);
    if (parsed.length < 650) return false; // No servidor há 1268 cards.
    dex = [...new Map(parsed.map(s => [s.id, s])).values()].sort((a, b) => a.id - b.id);
    byId.clear();
    for (const card of cards) {
      const id = Number(label(card).match(/#\s*(\d+)/)?.[1] || card.dataset.especie || card.dataset.id);
      if (id) byId.set(id, card);
    }
    synchronized = true;
    render();
    return true;
  }
  async function synchronize() {
    if (busy) return false;
    // Mesmo que já existam cards na página, a busca pode ter escondido todos
    // os outros quando o usuário fechou a Pokédex.
    await restoreDexCards();
    if (readDex()) {
      say('Pokédex sincronizada: ' + dex.length + ' espécies, ' +
        dex.filter(s => s.caught).length + ' capturadas.', 'success');
      return true;
    }
    const btn = menuDex();
    if (!btn) { say('Botão da Pokédex não encontrado.', 'error'); return false; }
    // Se a janela já está aberta, clicar de novo poderia fechá-la.
    if (!dexSearchVisible()) btn.click();
    for (let attempt = 0; attempt < 25; attempt++) {
      await wait(250);
      await restoreDexCards();
      if (readDex()) {
        say('Pokédex completa carregada, com busca limpa.', 'success');
        return true;
      }
    }
    say('Pokédex não carregou todos os Pokémon. Verifique filtros de geração, tipo ou vistos.', 'warning');
    return false;
  }
  function cardOf(species) {
    const cached = byId.get(species.id);
    if (cached?.isConnected) return cached;
    const card = many('.dex-card').find(node => speciesFromCard(node)?.id === species.id);
    if (card) byId.set(species.id, card);
    return card || null;
  }
  function gameCaught(species) {
    const card = cardOf(species);
    return card ? card.classList.contains('pego') : null;
  }
  // Ao contrário da Pokédex, o histórico pode registrar capturas repetidas.
  // Só usa entradas posteriores ao início da hunt e da própria espécie.
  // Se o histórico não estiver montado, nunca presume que houve captura.
  function recentHistoryCapture(active) {
    if (!active?.arrived) return null;
    const earliest = Math.max(active.started || 0, active.arrived || 0) - 1500;
    for (const row of many('.capturas-linha[data-k]')) {
      const key = row.dataset.k || '';
      const timestamp = Number(key.split(':')[0]);
      if (!Number.isFinite(timestamp) || timestamp < earliest || timestamp > Date.now() + 5000) continue;
      const name = label(el('.cap-nome', row));
      if (!name) continue;
      if (norm(name) === norm(active.name)) return { key, name, timestamp };
    }
    return null;
  }

  function updateCaptured(species) {
    const record = dex.find(item => item.id === species.id);
    if (record) record.caught = true;
    if (!state.captured.includes(species.id)) state.captured.push(species.id);
  }

  async function openSpecies(species) {
    // Antes de cada hunt, remove buscas deixadas pelo jogador na Pokédex.
    await restoreDexCards();
    let card = cardOf(species);
    if (!card && !await synchronize()) {
      say('Pokédex não está carregada. Sincronize novamente.', 'error');
      return false;
    }
    card = cardOf(species);
    if (!card) { pause('Card do Pokémon #' + species.id + ' não encontrado.'); return false; }

    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt === 1) {
        // Se o card não reagiu porque a Pokédex estava fechada,
        // abra a janela e restaure todos os cards antes de tentar de novo.
        if (!dexSearchVisible()) menuDex()?.click();
        await wait(250);
        await restoreDexCards();
        card = cardOf(species);
        if (!card) { pause('Card de ' + species.name + ' indisponível após limpar a busca.'); return false; }
      }
      card.click();
      for (let i = 0; i < 16; i++) {
        await wait(200);
        const ficha = el('#ficha-corpo');
        const id = Number(label(el('.fi-dex-num', ficha || document)).replace(/\D/g, ''));
        if (ficha && id === species.id) return true;
      }
    }
    pause('Não consegui abrir a ficha de ' + species.name + '.');
    return false;
  }
  function centerButton() { return el('#rb-center-schedule'); }
  function requestReturn() {
    if (state.returnPending || isCenter()) return true;
    const btn = centerButton();
    if (!btn || btn.disabled) {
      pause('Agendador de Centro Pokémon indisponível. Verifique os outros scripts.');
      return false;
    }
    const already = btn.getAttribute('aria-pressed') === 'true';
    state.returnPending = { at: Date.now(), confirmed: already, alerted: false };
    phase = 'returning';
    store();
    if (!already) btn.click();
    say('Retorno solicitado. Aguardando o jogo finalizar a batalha e levar ao Centro.');
    return true;
  }

  function finishCapture(current, evidence) {
    if (!state.current || state.current.id !== current.id) return;
    updateCaptured(current);
    state.index++;
    state.current = null;
    phase = 'returning';
    store();
    log('Captura confirmada: ' + current.name, evidence);
    say('✓ ' + current.name + ' registrado! Agendando retorno ao Centro.', 'success');
    requestReturn();
    render();
  }

  async function enterHunt(species) {
    if (!isCenter()) {
      pause('Antes de viajar, vá ao Centro Pokémon e clique em Iniciar para continuar.');
      return 'error';
    }
    if (!await openSpecies(species)) return 'error';
    const go = el('#ficha-corpo .fi-hunts button.fi-hunt[data-hunt]:not(.fi-safari-cta)');
    if (!go || go.disabled) return 'unavailable';
    // Nomes exibidos pela ficha são prioritários quando o catálogo é de versão anterior.
    const displayName = label(el('#ficha-corpo .fi-nome')) || species.name;
    species.name = displayName;
    const startBadge = captureBadge();
    state.current = {
      id: species.id, name: displayName, slug: go.dataset.hunt,
      started: Date.now(), arrived: 0, badgeBaseline: startBadge,
      retries: 0, retryStatus: '', lastWarningAt: 0,
      initialCaught: gameCaught(species) === true
    };
    phase = 'traveling';
    store();
    say('Indo para ' + displayName + '… aguardando confirmação da hunt.');
    go.click();
    return 'started';
  }

  async function retryTravel(active) {
    // Recuperação segura: só tenta outra viagem quando o HUD confirma o Centro.
    // Nunca tenta viajar diretamente de uma hunt, mesmo que não reconheça o nome.
    if (!isCenter() || state.returnPending || active.retries >= 2) return false;
    active.retries += 1;
    active.started = Date.now();
    active.retryStatus = 'Retentativa ' + active.retries + '/2';
    store();
    say('Ainda no Centro. Repetindo viagem para ' + active.name +
      ' (' + active.retryStatus + ').', 'warning');
    if (!await openSpecies(active)) return false;
    const buttons = many('#ficha-corpo .fi-hunts button.fi-hunt[data-hunt]');
    const go = buttons.find(b => b.dataset.hunt === active.slug && !b.disabled);
    if (!go) {
      pause('A hunt ' + active.slug + ' não está mais disponível.');
      return false;
    }
    go.click();
    return true;
  }

  async function advance() {
    if (busy || !state.running || state.paused || state.current || state.returnPending) return;
    if (!isCenter()) {
      pause('Não está no Centro Pokémon. Volte ao Centro e clique em Iniciar.');
      return;
    }
    busy = true;
    try {
      let examined = 0;
      while (state.running && !state.paused && !state.current && !state.returnPending &&
        state.index < state.queue.length && examined++ < 12) {
        const species = state.queue[state.index];
        if ((state.runMode !== 'weekly' && gameCaught(species) === true) ||
            state.captured.includes(species.id)) {
          state.index++;
          store();
          continue;
        }
        // A coluna normalHunt do catálogo não é definitiva: alguns Pokémon
        // comuns foram marcados incorretamente. A ficha real decide se há hunt.
        if (isExcluded(species.id, species.name)) {
          state.index++; store(); continue;
        }
        const outcome = await enterHunt(species);
        if (outcome === 'started' || outcome === 'error') return;
        if (outcome === 'unavailable') {
          if (!state.skipped.includes(species.id)) state.skipped.push(species.id);
          state.index++;
          store();
        }
      }
      if (state.index >= state.queue.length && state.running) {
        state.running = false;
        phase = 'finished';
        store();
        say('Fila percorrida. ' + state.skipped.length +
          ' espécies sem hunt normal permanecem pendentes.', 'success');
      }
    } finally { busy = false; }
  }
  async function cycle() {
    if (!state.running || state.paused || busy || polling) return;
    polling = true;
    try {
      if (state.returnPending) {
        if (isCenter()) {
          state.returnPending = null;
          phase = 'center';
          store();
          say('Chegou ao Centro Pokémon. Preparando a próxima hunt.', 'success');
          // O próximo tick chamará advance, sem interferir na espera do jogo.
        } else {
          const button = centerButton();
          if (button?.getAttribute('aria-pressed') === 'true') state.returnPending.confirmed = true;
          if (!state.returnPending.confirmed &&
              Date.now() - state.returnPending.at > 8000) {
            pause('Não foi possível confirmar o agendamento do Centro.');
          } else if (!state.returnPending.alerted &&
                     Date.now() - state.returnPending.at > 120000) {
            state.returnPending.alerted = true;
            store();
            say('Aguardando o retorno nativo; nenhuma viagem antecipada.', 'warning');
          }
        }
        return;
      }
      const active = state.current;
      if (!active) {
        await advance();
        return;
      }
      const evidence = targetEvidence(active);
      if (evidence) {
        active.missingSince = null;
        if (!active.arrived) {
          active.arrived = Date.now();
          phase = 'hunting';
          store();
          say('Caçando ' + active.name + ' (confirmado pelo ' + evidence + ').', 'success');
        }
        const badge = captureBadge();
        // O reset semanal do +1 ainda precisa ser confirmado em sessão real.
        // Aceita apenas AUMENTO posterior à entrada na hunt, nunca +1 antigo.
        if (badge > active.badgeBaseline) {
          finishCapture(active, 'Pokédex +' + badge + ' / ' + evidence);
          return;
        }
        if (state.runMode === 'weekly') {
          const history = recentHistoryCapture(active);
          if (history) {
            finishCapture(active, 'Histórico de captura ' + history.key + ' / ' + evidence);
            return;
          }
        } else if (gameCaught(active) === true && !active.initialCaught) {
          finishCapture(active, 'Pokédex .pego / ' + evidence);
          return;
        }
        if (badge < active.badgeBaseline) {
          active.badgeBaseline = badge;
          store();
        }
        return;
      }
      if (isCenter()) {
        // Se ainda está no Centro, a viagem não foi confirmada.
        // Retentar no máximo duas vezes e SEM mudar de espécie.
        if (Date.now() - active.started > 15000) {
          if (active.retries < 2) await retryTravel(active);
          else pause('A viagem para ' + active.name +
            ' falhou após 2 novas tentativas feitas do Centro Pokémon.');
        }
        return;
      }
      // Fora do Centro, o jogo pode ter entrado na hunt mesmo sem exibir o
      // nome no HUD. No modo economia, não existe cena visual para consultar.
      // Não pausar só por tempo nem tentar outra viagem de uma hunt ativa.
      if (Date.now() - active.started > 35000 &&
          Date.now() - (active.lastWarningAt || 0) > 60000) {
        active.lastWarningAt = Date.now();
        store();
        say('Hunt em andamento, mas a localização ainda não foi identificada: ' +
          active.name + '. Observando HUD/Analyser sem interferir na batalha.', 'warning');
      }
    } finally {
      polling = false;
    }
  }

  const CSS = [
    '#pio-ad-menu img{height:20px;width:20px;object-fit:contain}',
    '#pio-ad-menu{display:inline-flex;align-items:center;gap:4px}',
    '#pio-ad-panel{--ad-gold:#efcf8a;--ad-border:#9c6a3f;position:fixed;z-index:2147483000;top:72px;right:15px;width:min(410px,calc(100vw - 24px));color:#f7edd2;background:linear-gradient(155deg,#4d3027,#2c1b1c 50%,#1e1719);border:2px solid var(--ad-border);border-radius:10px;box-shadow:inset 0 0 0 2px #201313,0 14px 44px #000b;font:12px/1.5 system-ui,sans-serif;overflow:hidden}',
    '#pio-ad-panel[hidden]{display:none!important}',
    '#pio-ad-panel *{box-sizing:border-box}',
    '#pio-ad-panel header{display:flex;align-items:center;gap:8px;padding:9px 11px;background:linear-gradient(#68452d,#3b261d);border-bottom:1px solid #b48850}',
    '#pio-ad-panel header img{height:23px;width:23px;object-fit:contain}',
    '#pio-ad-panel .ad-brand{font:bold 14px Georgia,serif;color:#ffe3a2;text-shadow:0 1px #130c0a}',
    '#pio-ad-panel .ad-version{font:10px system-ui,sans-serif;opacity:.7;margin-left:5px}',
    '#pio-ad-panel .ad-close{margin-left:auto;padding:3px 8px;line-height:1.1;font-size:17px}',
    '#pio-ad-panel main{padding:11px}',
    '#pio-ad-panel button,#pio-ad-panel select,#pio-ad-panel input{font:inherit;color:#ffedcc;background:linear-gradient(#68422c,#432b25);border:1px solid #a47746;border-radius:5px;outline:none}',
    '#pio-ad-panel button{cursor:pointer;padding:6px 9px;font-weight:650}',
    '#pio-ad-panel button:hover{background:linear-gradient(#82603b,#59402a)}',
    '#pio-ad-panel button:disabled{opacity:.45;cursor:not-allowed}',
    '#pio-ad-panel button[data-ad="run"]{background:linear-gradient(#426d47,#28462f);border-color:#7ca76d}',
    '#pio-ad-panel .ad-row{display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin:9px 0}',
    '#pio-ad-panel .ad-options label{display:flex;flex:1;flex-direction:column;gap:3px;font-size:11px;color:#d5b88c;min-width:135px}',
    '#pio-ad-panel .ad-options select{width:100%;padding:7px 4px}',
    '#pio-ad-panel #pio-ad-status{min-height:35px;padding:7px 9px;background:#1a1415a8;border:1px solid #715036;border-radius:5px;color:#edd3a9}',
    '#pio-ad-panel #pio-ad-status[data-kind="success"]{color:#aee4a7}',
    '#pio-ad-panel #pio-ad-status[data-kind="warning"],#pio-ad-panel #pio-ad-status[data-kind="error"]{color:#ffcf8f}',
    '#pio-ad-panel .ad-stats{display:flex;justify-content:space-between;gap:6px;color:#d8bd8d;font-size:11px;margin-top:6px}',
    '#pio-ad-panel .ad-filter{width:120px;padding:6px}',
    '#pio-ad-panel .ad-search{flex:1;min-width:100px;padding:6px 8px;background:#24191b}',
    '#pio-ad-panel .ad-list{max-height:min(49vh,390px);overflow:auto;border:1px solid #765033;border-radius:6px;background:#1b1515}',
    '#pio-ad-panel .ad-species{display:flex;align-items:center;gap:10px;min-height:33px;padding:6px 9px;border-bottom:1px solid #5f423026}',
    '#pio-ad-panel .ad-species:last-child{border-bottom:0}',
    '#pio-ad-panel .ad-species.active{background:#5e4b24aa}',
    '#pio-ad-panel .ad-mark{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:17px;height:17px;font-size:15px;font-weight:850}',
    '#pio-ad-panel .ad-mark.yes{color:#a7e39b}',
    '#pio-ad-panel .ad-mark.no{color:#e5aa91}',
    '#pio-ad-panel .ad-name{flex:1;color:#f7e5c7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#pio-ad-panel .ad-number{font-size:10px;opacity:.65;font-variant-numeric:tabular-nums}',
    '#pio-ad-panel .ad-tag{font-size:10px;color:#d6b278}',
    '#pio-ad-panel .ad-empty{padding:18px 10px;text-align:center;color:#c4a987}',
    '#pio-ad-panel footer{padding:6px 10px;background:#24191b;border-top:1px solid #725037;color:#ac9276;font-size:10px}'
  ].join('\n');
  function mount() {
    const dexBtn = menuDex();
    if (dexBtn && !el('#pio-ad-menu')) {
      const btn = document.createElement('button');
      btn.id = 'pio-ad-menu';
      btn.type = 'button';
      btn.innerHTML = '<img src="/assets/site/assets/ui/menu-pokedex.png" alt=""><span>AutoDex</span>';
      btn.addEventListener('click', () => {
        const panel = el('#pio-ad-panel');
        if (panel) { panel.hidden = !panel.hidden; render(); }
      });
      dexBtn.insertAdjacentElement('afterend', btn);
    }
    if (!document.body || el('#pio-ad-panel')) return;
    const panel = document.createElement('section');
    panel.id = 'pio-ad-panel';
    panel.hidden = true;
    panel.innerHTML = [
      '<header><img src="/assets/site/assets/ui/menu-pokedex.png" alt="">',
      '<span class="ad-brand">AutoDex <span class="ad-version">by Dudu · v0.2.6</span></span>',
      '<button class="ad-close" type="button" data-ad="close" title="Fechar painel">×</button></header>',
      '<main><div id="pio-ad-status"></div>',
      '<div class="ad-row ad-options"><label>Modo <select id="pio-ad-mode">',
      '<option value="dex">Completar Pokédex</option>',
      '<option value="weekly">Corrida semanal de catch</option></select></label>',
      '<label>Ordem <select id="pio-ad-order">',
      '<option value="level">Nível da hunt (menor primeiro)</option>',
      '<option value="dex">Número da Pokédex</option>',
      '<option value="random">Aleatório</option></select></label></div>',
      '<div class="ad-row"><button data-ad="sync">Sincronizar</button>',
      '<button data-ad="queue">Criar fila</button>',
      '<button data-ad="run">Iniciar</button>',
      '<button data-ad="pause">Pausar</button>',
      '<button data-ad="stop">Parar</button></div>',
      '<div class="ad-stats"><span id="pio-ad-counts"></span><span id="pio-ad-progress"></span></div>',
      '<div class="ad-row"><select class="ad-filter" id="pio-ad-filter">',
      '<option value="pending">Pendentes</option><option value="caught">Capturados</option>',
      '<option value="all">Todos</option></select>',
      '<input type="search" class="ad-search" id="pio-ad-search" placeholder="Buscar Pokémon">',
      '</div><div class="ad-list" id="pio-ad-list"></div></main>',
      '<footer>O painel pode ficar fechado. A aba do jogo deve permanecer aberta.</footer>'
    ].join('');
    document.body.appendChild(panel);
    panel.addEventListener('click', async e => {
      const action = e.target.closest('[data-ad]')?.dataset.ad;
      if (!action) return;
      if (action === 'close') { panel.hidden = true; return; }
      if (busy) return;
      if (action === 'sync') {
        await synchronize();
      } else if (action === 'queue') {
        if (!synchronized && !await synchronize()) return;
        if (state.running) { pause('Pare antes de recriar a fila.'); return; }
        // Ordem estritamente numérica da Pokédex, incluindo entradas de Outland
        // (ex.: #2001, #2002) quando existirem no DOM real da Pokédex.
        // Não priorizar "vistos" e não restringir espécies ao catálogo estático.
        const mode = validMode(el('#pio-ad-mode', panel).value);
        const order = validOrder(el('#pio-ad-order', panel).value);
        state.modePreference = mode;
        state.orderPreference = order;
        state.runMode = mode;
        state.runOrder = order;
        state.queue = sortQueue(
          dex.filter(s => (mode === 'weekly' || !s.caught) && !isExcluded(s.id, s.name))
            .map(({id, name, normalHunt}) => ({id, name, normalHunt})),
          order
        );
        state.index = 0; state.captured = []; state.skipped = [];
        state.current = null; state.returnPending = null;
        state.running = false; state.paused = false;
        store(); phase = 'ready';
        say('Fila ' + (mode === 'weekly' ? 'semanal (inclui já capturados)' : 'da Dex (somente pendentes)') +
          ': ' + state.queue.length + ' espécies, ordem ' +
          ({level:'por nível',dex:'da Pokédex',random:'aleatória'})[order] + '.', 'success');
      } else if (action === 'run') {
        if (!synchronized) { say('Sincronize a Pokédex antes de iniciar.', 'warning'); return; }
        if (!state.queue.length) { say('Clique em Criar fila antes de iniciar.', 'warning'); return; }
        if (!state.current && !state.returnPending && !isCenter()) {
          state.running = false; state.paused = false; store();
          say('Vá ao Centro Pokémon antes de iniciar. Depois clique em Iniciar.', 'warning');
          return;
        }
        // Se uma tentativa anterior foi pausada e o jogador retornou ao Centro,
        // recomeça a MESMA espécie em vez de esperar uma hunt que já não existe.
        if (state.paused && state.current && isCenter() && !state.returnPending) {
          log('Retomada no Centro: repetindo ' + state.current.name);
          state.current = null;
        }
        state.running = true; state.paused = false; store();
        phase = 'ready'; say('AutoDex iniciado.', 'success');
        if (state.returnPending || state.current) await cycle();
        else await advance();
      } else if (action === 'pause') {
        if (!state.running) { say('Inicie a automação primeiro.'); return; }
        state.paused = !state.paused;
        store();
        say(state.paused ? 'AutoDex pausado.' : 'AutoDex retomado.');
        if (!state.paused) { await cycle(); await advance(); }
      } else if (action === 'stop') {
        state.running = false; state.paused = false;
        state.current = null; state.returnPending = null; store();
        phase = 'stopped';
        say('Parado. Fila preservada. Retorno já agendado no jogo não será cancelado.');
      }
      render();
    });
    const modeSelector = el('#pio-ad-mode', panel);
    const orderSelector = el('#pio-ad-order', panel);
    modeSelector.value = state.modePreference;
    orderSelector.value = state.orderPreference;
    function changedOptions() {
      const mode = validMode(modeSelector.value);
      if (mode === 'weekly' && orderSelector.value === 'random') orderSelector.value = 'level';
      el('option[value="random"]', orderSelector).disabled = mode === 'weekly';
      state.modePreference = mode;
      state.orderPreference = validOrder(orderSelector.value);
      store();
      render();
    }
    modeSelector.addEventListener('change', changedOptions);
    orderSelector.addEventListener('change', changedOptions);
    changedOptions();
    el('#pio-ad-filter', panel).addEventListener('change', render);
    el('#pio-ad-search', panel).addEventListener('input', render);
    render();
  }
  function render() {
    const panel = el('#pio-ad-panel');
    if (!panel) return;
    const status = el('#pio-ad-status', panel);
    status.textContent = notice;
    status.dataset.kind = noticeKind;
    const btn = el('[data-ad="pause"]', panel);
    btn.textContent = state.paused ? 'Retomar' : 'Pausar';
    el('#pio-ad-mode', panel).disabled = state.running;
    el('#pio-ad-order', panel).disabled = state.running;
    el('#pio-ad-counts', panel).textContent = synchronized
      ? (dex.filter(s => s.caught).length + ' ✓ / ' + dex.length + ' espécies')
      : 'Pokédex não sincronizada';
    el('#pio-ad-progress', panel).textContent = state.queue.length
      ? ((state.runMode === 'weekly' ? 'Semana' : 'Fila') +
        ': ' + state.index + '/' + state.queue.length) : '';
    const list = el('#pio-ad-list', panel);
    if (!synchronized) {
      list.replaceChildren();
      const empty = document.createElement('div');
      empty.className = 'ad-empty';
      empty.textContent = 'Sincronize para carregar a lista de Pokémon.';
      list.appendChild(empty);
      return;
    }
    const filter = el('#pio-ad-filter', panel).value;
    const search = norm(el('#pio-ad-search', panel).value);
    // "Pendente" no modo semanal inclui espécies já registradas na Dex.
    const weeklyView = state.modePreference === 'weekly';
    const completedInView = item => weeklyView
      ? (state.runMode === 'weekly' && state.queue.length > 0 &&
          state.captured.includes(item.id))
      : item.caught;
    const rows = dex.filter(item =>
      !isExcluded(item.id, item.name) &&
      (filter === 'all' || (filter === 'caught' ? completedInView(item) : !completedInView(item))) &&
      (!search || norm(item.name).includes(search) || String(item.id).includes(search))
    );
    list.replaceChildren(...rows.slice(0, 250).map(item => {
      const entry = document.createElement('div');
      entry.className = 'ad-species' + (state.current?.id === item.id ? ' active' : '');
      const check = document.createElement('span');
      const completed = completedInView(item);
      check.className = 'ad-mark ' + (completed ? 'yes' : 'no');
      check.textContent = completed ? '✓' : '×';
      const name = document.createElement('span');
      name.className = 'ad-name';
      name.textContent = item.name;
      const no = document.createElement('span');
      no.className = 'ad-number';
      no.textContent = '#' + String(item.id).padStart(3, '0');
      entry.append(check, name, no);
      if (state.current?.id === item.id) {
        const tag = document.createElement('span');
        tag.className = 'ad-tag';
        tag.textContent = 'Em hunt';
        entry.appendChild(tag);
      }
      return entry;
    }));
    if (rows.length > 250) {
      const end = document.createElement('div');
      end.className = 'ad-empty';
      end.textContent = 'Mostrando 250 de ' + rows.length + '. Use a busca para localizar outro Pokémon.';
      list.appendChild(end);
    }
    if (!rows.length) {
      const end = document.createElement('div');
      end.className = 'ad-empty'; end.textContent = 'Nenhum Pokémon encontrado.';
      list.appendChild(end);
    }
  }

  const css = document.createElement('style');
  css.id = 'pio-ad-css';
  css.textContent = CSS;
  (document.head || document.documentElement).appendChild(css);

  window.PIOAutoDex = {
    diagnostico() {
      return {
        version: '0.2.6',
        synchronized, cards: many('.dex-card').length,
        pegos: many('.dex-card.pego').length,
        badge: captureBadge(), hud: hud(), analyzer: analyzerHunt(),
        pokedexBusca: dexSearchInput()?.value || '', dexCardsVisiveisNoDom: many('.dex-card').length,
        evidence: targetEvidence(state.current), centroConfirmado: isCenter(),
        excluidosDoCatalogo: excludedIds.size,
        centerScheduled: centerButton()?.getAttribute('aria-pressed'),
        mode: state.runMode, order: state.runOrder,
        preferences: {mode:state.modePreference, order:state.orderPreference},
        knownHuntLevels: huntLevels.size,
        phase, state: {
          running: state.running, paused: state.paused, index: state.index,
          queue: state.queue.length, 
          proximos: state.queue.slice(state.index, state.index + 12).map(item => ({id: item.id, name: item.name})),
          ordemNumericaRestante: state.queue.slice(state.index).every((item, i, remaining) =>
            i === 0 || Number(remaining[i - 1].id) <= Number(item.id)),
          current: state.current,
          returnPending: state.returnPending
        },
        message: notice, recentEvents: sessionEvents.slice(-12)
      };
    }
  };

  mount();
  setInterval(() => {
    mount();
    if (state.running) cycle().catch(error => {
      console.error('[PIO AutoDex]', error);
      pause('Falha inesperada; envie o diagnóstico do Console.');
    });
  }, 650);
})();