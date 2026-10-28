import type { Brand, BrandCategory } from "./brands.data";

/**
 * Brands with no bundled official mark (their owners had them removed from simple-icons).
 * Their logo is loaded from the company's website, and the tile falls back to initials if
 * it cannot be loaded. Keep specific names before general ones, for example
 * "flipkart pay later" before "flipkart".
 */
const web = (
  id: string,
  label: string,
  category: BrandCategory,
  domain: string,
  keywords: string[]
): Brand => ({ id, label, category, domain, keywords });

export const WEB_BRANDS: Brand[] = [
  // EMI & pay later
  web("flipkart-pay-later", "Flipkart Pay Later", "EMI & pay later", "flipkart.com", ["flipkart pay later", "flipkart paylater", "fk pay later"]),
  web("meesho-pay-later", "Meesho Pay Later", "EMI & pay later", "meesho.com", ["meesho pay later", "meesho paylater"]),
  web("amazon-pay-later", "Amazon Pay Later", "EMI & pay later", "amazon.in", ["amazon pay later", "amazon paylater", "amazon pay"]),
  web("snapmint", "Snapmint", "EMI & pay later", "snapmint.com", ["snapmint"]),
  web("simpl", "Simpl", "EMI & pay later", "getsimpl.com", ["simpl"]),
  web("lazypay", "LazyPay", "EMI & pay later", "lazypay.in", ["lazypay", "lazy pay"]),
  web("zestmoney", "ZestMoney", "EMI & pay later", "zestmoney.in", ["zestmoney", "zest money"]),
  web("slice", "Slice", "EMI & pay later", "sliceit.com", ["slice pay", "slice card", "slice emi"]),
  web("kreditbee", "KreditBee", "EMI & pay later", "kreditbee.in", ["kreditbee", "kredit bee"]),
  web("kissht", "Kissht", "EMI & pay later", "kissht.com", ["kissht"]),
  web("moneyview", "Money View", "EMI & pay later", "moneyview.in", ["moneyview", "money view"]),
  web("navi", "Navi", "EMI & pay later", "navi.com", ["navi"]),
  web("fibe", "Fibe", "EMI & pay later", "myfibe.com", ["fibe", "earlysalary", "early salary"]),
  web("paytm-postpaid", "Paytm Postpaid", "EMI & pay later", "paytm.com", ["paytm postpaid", "paytm post paid"]),
  web("mobikwik", "MobiKwik", "EMI & pay later", "mobikwik.com", ["mobikwik", "mobikwik zip"]),
  web("freecharge", "Freecharge", "EMI & pay later", "freecharge.in", ["freecharge", "freecharge pay later"]),
  web("bajaj-finserv", "Bajaj Finserv", "EMI & pay later", "bajajfinserv.in", ["bajaj finserv", "bajaj finance", "bajaj emi"]),
  web("onecard", "OneCard", "EMI & pay later", "getonecard.app", ["onecard", "one card"]),
  web("uni", "Uni", "EMI & pay later", "getuni.app", ["uni pay", "uni card", "uni pay later"]),
  web("home-credit", "Home Credit", "EMI & pay later", "homecredit.co.in", ["home credit"]),
  web("tata-neu", "Tata Neu", "EMI & pay later", "tataneu.com", ["tata neu"]),

  // banks & cards
  web("sbi", "State Bank of India", "Banks & cards", "sbi.co.in", ["sbi", "state bank of india"]),
  web("kotak", "Kotak Mahindra Bank", "Banks & cards", "kotak.com", ["kotak"]),
  web("idfc-first", "IDFC FIRST Bank", "Banks & cards", "idfcfirstbank.com", ["idfc"]),
  web("yes-bank", "Yes Bank", "Banks & cards", "yesbank.in", ["yes bank"]),
  web("indusind", "IndusInd Bank", "Banks & cards", "indusind.com", ["indusind"]),
  web("rbl", "RBL Bank", "Banks & cards", "rblbank.com", ["rbl"]),
  web("au-bank", "AU Small Finance Bank", "Banks & cards", "aubank.in", ["au bank", "au small finance"]),

  // shopping
  web("amazon-prime", "Amazon Prime", "Streaming", "primevideo.com", ["amazon prime", "prime video"]),
  web("amazon", "Amazon", "Food, shopping & travel", "amazon.in", ["amazon"]),
  web("flipkart", "Flipkart", "Food, shopping & travel", "flipkart.com", ["flipkart"]),
  web("meesho", "Meesho", "Food, shopping & travel", "meesho.com", ["meesho"]),
  web("myntra", "Myntra", "Food, shopping & travel", "myntra.com", ["myntra"]),
  web("nykaa", "Nykaa", "Food, shopping & travel", "nykaa.com", ["nykaa"]),
  web("ajio", "Ajio", "Food, shopping & travel", "ajio.com", ["ajio"]),
  web("blinkit", "Blinkit", "Food, shopping & travel", "blinkit.com", ["blinkit"]),
  web("zepto", "Zepto", "Food, shopping & travel", "zeptonow.com", ["zepto"]),
  web("jiomart", "JioMart", "Food, shopping & travel", "jiomart.com", ["jiomart"]),
  web("croma", "Croma", "Food, shopping & travel", "croma.com", ["croma"]),
  web("walmart", "Walmart", "Food, shopping & travel", "walmart.com", ["walmart"]),
  web("costco", "Costco", "Food, shopping & travel", "costco.com", ["costco"]),
  web("best-buy", "Best Buy", "Food, shopping & travel", "bestbuy.com", ["best buy", "bestbuy"]),
  web("grubhub", "Grubhub", "Food, shopping & travel", "grubhub.com", ["grubhub"]),
  web("ola", "Ola", "Food, shopping & travel", "olacabs.com", ["ola cabs", "ola electric", "ola"]),
  web("rapido", "Rapido", "Food, shopping & travel", "rapido.bike", ["rapido"]),
  web("makemytrip", "MakeMyTrip", "Food, shopping & travel", "makemytrip.com", ["makemytrip", "make my trip"]),
  web("goibibo", "Goibibo", "Food, shopping & travel", "goibibo.com", ["goibibo"]),
  web("redbus", "redBus", "Food, shopping & travel", "redbus.in", ["redbus"]),
  web("irctc", "IRCTC", "Food, shopping & travel", "irctc.co.in", ["irctc"]),
  web("skyscanner", "Skyscanner", "Food, shopping & travel", "skyscanner.net", ["skyscanner"]),

  // streaming & entertainment
  web("hotstar", "Disney+ Hotstar", "Streaming", "hotstar.com", ["hotstar", "jiohotstar", "disney+", "disney plus", "disney"]),
  web("hulu", "Hulu", "Streaming", "hulu.com", ["hulu"]),
  web("peacock", "Peacock", "Streaming", "peacocktv.com", ["peacock"]),
  web("jiocinema", "JioCinema", "Streaming", "jiocinema.com", ["jiocinema", "jio cinema"]),
  web("sonyliv", "SonyLIV", "Streaming", "sonyliv.com", ["sonyliv", "sony liv"]),
  web("zee5", "ZEE5", "Streaming", "zee5.com", ["zee5"]),
  web("sunnxt", "Sun NXT", "Streaming", "sunnxt.com", ["sun nxt", "sunnxt"]),
  web("altbalaji", "ALTBalaji", "Streaming", "altbalaji.com", ["altbalaji", "alt balaji"]),
  web("eventbrite", "Eventbrite", "Lifestyle", "eventbrite.com", ["eventbrite"]),

  // gaming
  web("xbox", "Xbox", "Gaming", "xbox.com", ["xbox", "game pass"]),
  web("nintendo", "Nintendo", "Gaming", "nintendo.com", ["nintendo"]),
  web("battlenet", "Battle.net", "Gaming", "battle.net", ["battle.net", "blizzard"]),
  web("geforce-now", "GeForce NOW", "Gaming", "nvidia.com", ["geforce now", "nvidia"]),

  // AI
  web("chatgpt", "ChatGPT", "AI", "chatgpt.com", ["chatgpt", "chat gpt", "gpt plus", "openai"]),
  web("microsoft-copilot", "Microsoft Copilot", "AI", "copilot.microsoft.com", ["microsoft copilot"]),
  web("midjourney", "Midjourney", "AI", "midjourney.com", ["midjourney"]),
  web("grok", "Grok", "AI", "grok.com", ["grok", "xai"]),
  web("character-ai", "Character.AI", "AI", "character.ai", ["character.ai", "character ai"]),

  // work & productivity
  web("microsoft-365", "Microsoft 365", "Work & productivity", "microsoft.com", ["microsoft 365", "office 365", "m365", "microsoft office"]),
  web("onedrive", "OneDrive", "Cloud storage", "onedrive.live.com", ["onedrive"]),
  web("microsoft-teams", "Microsoft Teams", "Work & productivity", "teams.microsoft.com", ["microsoft teams"]),
  web("outlook", "Outlook", "Work & productivity", "outlook.com", ["outlook"]),
  web("microsoft", "Microsoft", "Work & productivity", "microsoft.com", ["microsoft"]),
  web("google-one", "Google One", "Cloud storage", "one.google.com", ["google one"]),
  web("adobe", "Adobe", "Work & productivity", "adobe.com", ["adobe", "creative cloud", "photoshop", "lightroom", "acrobat", "premiere pro"]),
  web("canva", "Canva", "Work & productivity", "canva.com", ["canva"]),
  web("slack", "Slack", "Work & productivity", "slack.com", ["slack"]),
  web("1password", "1Password", "Security & VPN", "1password.com", ["1password", "onepassword"]),
  web("monday", "monday.com", "Work & productivity", "monday.com", ["monday.com"]),
  web("lucidchart", "Lucidchart", "Work & productivity", "lucidchart.com", ["lucidchart"]),
  web("ahrefs", "Ahrefs", "Work & productivity", "ahrefs.com", ["ahrefs"]),
  web("skype", "Skype", "Social & chat", "skype.com", ["skype"]),

  // reading & news
  web("nytimes", "The New York Times", "Reading & news", "nytimes.com", ["new york times", "nytimes", "nyt"]),
  web("wsj", "The Wall Street Journal", "Reading & news", "wsj.com", ["wall street journal", "wsj"]),
  web("washington-post", "The Washington Post", "Reading & news", "washingtonpost.com", ["washington post"]),
  web("the-hindu", "The Hindu", "Reading & news", "thehindu.com", ["the hindu"]),
  web("times-of-india", "The Times of India", "Reading & news", "timesofindia.indiatimes.com", ["times of india", "toi"]),
  web("economist", "The Economist", "Reading & news", "economist.com", ["economist"]),
  web("bloomberg", "Bloomberg", "Reading & news", "bloomberg.com", ["bloomberg"]),
  web("kindle", "Kindle", "Reading & news", "amazon.in", ["kindle"]),
  web("scribd", "Scribd", "Reading & news", "scribd.com", ["scribd", "everand"]),
  web("wired", "WIRED", "Reading & news", "wired.com", ["wired"]),
  web("forbes", "Forbes", "Reading & news", "forbes.com", ["forbes"]),
  web("the-atlantic", "The Atlantic", "Reading & news", "theatlantic.com", ["the atlantic"]),

  // fitness & health
  web("calm", "Calm", "Fitness & health", "calm.com", ["calm"]),
  web("myfitnesspal", "MyFitnessPal", "Fitness & health", "myfitnesspal.com", ["myfitnesspal"]),
  web("cultfit", "cult.fit", "Fitness & health", "cult.fit", ["cult.fit", "cultfit", "cult fit"]),
  web("healthifyme", "HealthifyMe", "Fitness & health", "healthifyme.com", ["healthifyme"]),
  web("noom", "Noom", "Fitness & health", "noom.com", ["noom"]),
  web("whoop", "WHOOP", "Fitness & health", "whoop.com", ["whoop"]),
  web("oura", "Oura", "Fitness & health", "ouraring.com", ["oura"]),

  // finance & investing
  web("cred", "CRED", "Finance & payments", "cred.club", ["cred"]),
  web("groww", "Groww", "Finance & payments", "groww.in", ["groww"]),
  web("upstox", "Upstox", "Finance & payments", "upstox.com", ["upstox"]),
  web("kraken", "Kraken", "Finance & payments", "kraken.com", ["kraken"]),
  web("splitwise", "Splitwise", "Finance & payments", "splitwise.com", ["splitwise"]),
  web("ynab", "YNAB", "Finance & payments", "ynab.com", ["ynab"]),

  // telecom
  web("vi", "Vi", "Telecom", "myvi.in", ["vodafone idea", "vi postpaid", "vi prepaid"]),
  web("bsnl", "BSNL", "Telecom", "bsnl.co.in", ["bsnl"]),
  web("t-mobile", "T-Mobile", "Telecom", "t-mobile.com", ["t-mobile", "tmobile"]),
  web("att", "AT&T", "Telecom", "att.com", ["at&t"]),
  web("xfinity", "Xfinity", "Telecom", "xfinity.com", ["xfinity"]),

  // lifestyle
  web("bumble", "Bumble", "Lifestyle", "bumble.com", ["bumble"]),
  web("hinge", "Hinge", "Lifestyle", "hinge.co", ["hinge"]),
];
