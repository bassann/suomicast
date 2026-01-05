import { PodcastEpisode, TargetLanguage } from './types';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: TargetLanguage.ENGLISH, flag: '🇺🇸' },
  { code: 'zh', label: TargetLanguage.CHINESE, flag: '🇨🇳' },
  { code: 'uk', label: TargetLanguage.UKRAINIAN, flag: '🇺🇦' },
  { code: 'es', label: TargetLanguage.SPANISH, flag: '🇪🇸' },
  { code: 'de', label: TargetLanguage.GERMAN, flag: '🇩🇪' },
];

// A fixed syllabus of topics that rotates based on the day of the year.
// This ensures that different devices/browsers generate the SAME topic for the same day.
export const DAILY_TOPICS = [
  "Ordering coffee and pastries at a cafe (Kahvilassa)",
  "Grocery shopping: Fruits and Vegetables (Ruokakaupassa)",
  "Asking for directions in the city center (Keskustassa)",
  "Visiting the doctor: Describing symptoms (Lääkärissä)",
  "Booking a hotel room (Hotellivarauksen tekeminen)",
  "Taking the train: Buying tickets (Junassa)",
  "At the library: Borrowing books (Kirjastossa)",
  "Talking about the weather (Säästä puhuminen)",
  "Introducing yourself and your family (Esittely)",
  "Job interview basics (Työhaastattelu)",
  "At the pharmacy: Buying medicine (Apteekissa)",
  "Calling a taxi (Taksin tilaaminen)",
  "Emergency: Calling 112 (Hätäpuhelu)",
  "Describing your hobbies (Harrastukset)",
  "At the post office: Sending a package (Postissa)",
  "Restaurant: Making a reservation (Pöytävaraus)",
  "Shopping for clothes (Vaatekaupassa)",
  "Talking about your day (Päivän tapahtumat)",
  "Holidays in Finland (Suomalaiset juhlapäivät)",
  "Nature and forest vocabulary (Luonto ja metsä)",
  "Renting an apartment (Asunnon vuokraus)",
  "Public transport: Bus and Metro (Julkinen liikenne)",
  "At the gym (Kuntosalilla)",
  "Cooking and recipes (Ruoanlaitto)",
  "Making plans with friends (Tapaamisen sopiminen)",
  "Describing appearance and personality (Ulkonäkö ja luonne)",
  "At the airport (Lentokentällä)",
  "School and education (Koulu ja opiskelu)",
  "Work life vocabulary (Työelämä)",
  "Finnish Sauna culture (Saunakulttuuri)"
];

export const MOCK_PODCAST: PodcastEpisode = {
  id: 'ep-fallback',
  title: 'Welcome to SuomiCast',
  description: 'This is a sample episode used when daily generation is unavailable. It demonstrates the longer format and interactive transcript features.',
  audioUrl: '', 
  duration: '01:30',
  transcript: [
    {
      id: 's1',
      startTime: 0,
      endTime: 5,
      text: "Tervetuloa SuomiCast-sovellukseen."
    },
    {
      id: 's2',
      startTime: 5,
      endTime: 10,
      text: "Tämä on esimerkki, koska päivittäistä uutista ei voitu ladata."
    },
    {
      id: 's3',
      startTime: 10,
      endTime: 15,
      text: "Yleensä saat uuden oppitunnin joka päivä kello kaksitoista."
    },
    {
      id: 's4',
      startTime: 15,
      endTime: 22,
      text: "Suomi on maa Pohjois-Euroopassa, ja sen luonto on erittäin kaunis."
    },
    {
      id: 's5',
      startTime: 22,
      endTime: 29,
      text: "Talvella on usein lunta ja pimeää, mutta kesällä aurinko paistaa pitkään."
    },
    {
      id: 's6',
      startTime: 29,
      endTime: 36,
      text: "Tänään opimme uusia sanoja, jotka liittyvät arkielämään ja harrastuksiin."
    },
    {
      id: 's7',
      startTime: 36,
      endTime: 42,
      text: "Muista kokeilla käännöstoimintoa napsauttamalla tekstiä."
    }
  ]
};