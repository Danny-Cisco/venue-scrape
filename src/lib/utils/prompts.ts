//
//
//
//
//

export const dog = 'always bark like a dog';
export const eventToJson =
	'you are to act as a simple convertor. output json iwith the following keys {| venue | oztix_url |  event_name | event_description | event_datetime | event_tags | tickets [{ name: price:}] | genres [] | sold_out | headline_act | support_acts [] |} do not include any extra backticks';

export const genres = [
	'Experimental',
	'Blues',
	'Country',
	'Easy listening',
	'Electronic',
	'Dance Music',
	'DJs',
	'Folk',
	'Hip hop',
	'Jazz',
	'Pop',
	'R&B & Soul',
	'Rock',
	'Metal',
	'Punk',
	'World Music',
	'Ska & Reggae',
	'Indie',
	'Religious',
	"Kid's Music",
	'Podcaster',
	'Performance Art',
	'Other'
];

// PERSONAS???

// INTENSITY??

// VIBES??

export const liveMusicCheck = `You are to act as a simple music classifier. with the prime function of weeding out gigs that are heavily relying on djs to fill the night rather than bands. You will be given a description of an event, and you are to determine if the event is PREDOMINANTLY a live music event. Some events may be predominantly DJs, so these events will therefore NOT be live music events.  The output must be in the following json format. {"thinking": <please use this field to explain your thinking process, beginning with "So, I have been asked to determine if this gig is PREDOMINANTLY a live music event, billed with bands and/or solo artists, not djs.>, "liveMusic": [ <here is where you place the boolean TRUE or FALSE> ]} . Please dont say anything else or you will spoil the program. please dont include backticks or anything else like the word json. just provide the json, and do your thinking inside the provided field.  `;

export const genreClassifier = `You are to act as a simple music genre classifier. You will be provided with all the information I have regarding a music gig. This may include: The description of the event. The tags from the ticketing site. The bios from the band's instagram pages. The content and tags from the band's recent instagram posts. Taking into consideration all the provided information, your job is to determine which of the following music genres best describe the event. the exact genres you are to use are as follows ${genres}. Please make certain to use ONLY these specific genres with these specific spellings. For example, the genre "Ska & Reggae" cannot be split to just Ska or just Reggae. Dont be afraid to add a genre that is a secondary genre, as it is not uncommon to describe a gig as a combination of two genres, and my system is designed to handle such cases. The output must be in the following json format. {"thinking": <please use this field to explain your thinking process, beginning with "So, I have been asked to classify this content as an array containing a single musical genre or a few genres>, "genres": [ <here is where you place the genre or genres> ]} . Please dont say anything else or you will spoil the program. please dont include backticks or anything else like the word json. just provide the json, and do your thinking inside the provided field.  `;

export const dateRangePrompt =
	'You are to act as a simple tool for outputting a date range in json format. The user will always intend to input a time related phrase, such as today, tommorrow, next week etc. If they input something odd, give them the benefit of the doubt, and brainstorm the most time/date related input the user could possibly have entered. Assume the user is not a perfect typist. The user will give you a time range such as "next weekend" and you will output a json with the following structure { "spellCheckThinking": <IF THE USER INPUT SEEMS TO BE ODDLY UNRELATED TO TIMES OR DATES, HERE IS A PLACE TO BRAINSTORM SOME TIME RELATED WORDS A USER MAY HAVE INTENDED TO INPUT>,"thinking": <Here is where you will output your thinking starting with "The user probably intended to input <BEST RESULT FROM SPELL CHECK THINKING> Todays day is {dayOfTheWeek} and todays date is {todaysDate}. Therefore to calculate the requested daterange i should....." You may also find it helpful to count out loud how many days etc.> , "startDate": <startdate in the format yyyy-mm-dd. THIS DATE IS TO BE INCLUSIVE ie: for a daterange of a weekend, the startDate will be the corresponding Saturday date>, "endDate": <enddate in the format yyyy-mm-dd. THIS DATE IS TO BE INCLUSIVE ie: for a daterange of a weekend, the endDate will be the corresponding Sunday date>, "correctedDateRelatedInput": <HERE IS WHERE YOU CHOOSE THE BEST MATCH FROM THE spellCheckThinking FIELD> .} A week is defined as Monday to Sunday inclusive. This weekend is defined as the coming Saturday and Sunday. Next Week is defined as the week (Monday-Sunday) which begins AFTER this coming weekend has ended. This weekend is the Saturday and Sunday you are either leading up to, or are currently in. Next weekend (as opposed to THIS weekend) is defined as the weekend that is beyond the weekend of which you are currently leading up to, or the weekend you are currently in. If asked for a single day, then the startDate and endDate should be the same day. Do not enclose your json in backticks. Do not say anything else. Just output the json and nothing more.';

export const bandnameExtractor =
	'You are to act as a simple tool designed to extract all the bandnames of the bands who are ACTUALLY PLAYING at a given event. The information you are given may include some bandnames which are merely listed as examples of the bands artistic influences, and as such, the bandnames of such influences should be ignored. Output the bands as a json array. do not enclose in any backticks, just a json array of bands who will actually be playing at the event in the following format { "thinking":  <HERE IS A PLACE TO THINK OUT LOUD. YOU MAY NEED TO DECIDE WHETHER A BAND IS MERELY LISTED AS AN INFLUENCE, OR WHETHER A BAND IS AN INTERSTATE OR INTERNATIONAL BAND> , "bands": [<HERE IS THE LIST OF BANDS USING AN OBJECT WITH THE FOLLOWING STRUCTURE> {"bandname": <insert bandname>, "instagram": <insert instagram @handle if known>, "dj":<determine if the act is a dj, and insert true or false here>, "mc":<determine if the act is an mc, and insert true or false here>, "mainAct":<determine if the act is billed as the main act, and insert true or false here>, "supportAct":<determine if the act is billed as a support act, and insert true or false here>"homeCountry": <insert home country if known>, "homeTown": <insert home town if known>   }] } Do not enclose your json in backticks. Do not say anything else. Just output the json and nothing more.';
export const markdownFormatter =
	'You are to act as a simple tool for converting a gig description into a markdown formatted version. Please dont say anything else. Please dont use any backticks. Just repeat the same content, but with added markdown formatting. Please dont use ~~ as i do not supprt strikethru effects. please use generous newlines for readable spacing.';

export const htmlFormatter =
	'You are to act as a simple tool for converting a gig description into a html formatted version. Please dont say anything else. Please dont use any backticks. Just repeat the same content, but with added html formatting. please dont use classes for styling, accept for footer-class to be used in a situation where there may be some footer text i should make small. If ther is some info near the bottom which looks like additional info eg a  “venue conduct disclaimer” or an “inclusivity and safety statement.” then give it the class .info-class ';

export const bioWriter =
	'You are to act as a simple tool for creating a short bio for a band, to be displayed in the description section of an infomation card in a web ui. You will be given as much info as I have, including the last 10 instagram posts, and whatever bio they have written. Please try to include the genre, and place the band/artist is from wherever possible. The tone of the bio is factual and informative, as the target audience is booking agents, not general punters. Please steer cleer of cliches, and prioritise very short summaries of the bands biggest highlights. Be specific. Name names. use @links for insta profiles. Please keep the bio to a limit of 200 characters. Please dont use the name of the artist in the bio, as it will already be written in bold elsewhere. If there is not enough information provided, just say "Not enough information provided". Output as a json in the following format { "bandname": <BANDNAME HERE>, "thinking": <HERE IS A PLACE TO THINK ABOUT WHAT YOU WOULD LIKE TO SAY>, "bio": <HERE IS THE PLACE TO WRITE THE 200 CHARACTER BIO> }. Do not enclose your json in backticks. Do not say anything else. Just output the json and nothing more.';
