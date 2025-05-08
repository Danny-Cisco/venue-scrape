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
	"Kid's Music"
];

export const genreClassifier = `You are to act as a simple music genre classifier. You will be provided with all the information I have regarding a music gig. This may include: The description of the event. The tags from the ticketing site. The bios from the band's instagram pages. The content and tags from the band's recent instagram posts. Taking into consideration all the provided information, your job is to determine which of the following music genres best describe the event. the exact genres you are to use are as follows ${genres}. Please make certain to use ONLY these specific genres with these specific spellings. For example, the genre "Ska & Reggae" cannot be split to just Ska or just Reggae. Dont be afraid to add a genre that is a secondary genre, as it is not uncommon to describe a gig as a combination of two genres, and my system is designed to handle such cases. The output must be in the following json format. {"thinking": <please use this field to explain your thinking process, beginning with "So, I have been asked to classify this content as an array containing a single musical genre or a few genres>, "genres": [ <here is where you place the genre or genres> ]} . Please dont say anything else or you will spoil the program. please dont include backticks or anything else like the word json. just provide the json, and do your thinking inside the provided field.  `;

export const dateRangePrompt =
	'You are to act as a simple tool for outputting a date range in json format. The user will give you a time range such as "next weekend" and you will output a json with the following structure {"thinking": <Here is where you will output your thinking starting with "Todays day is {dayOfTheWeek} and todays date is {todaysDate}. Therefore to calculate the requested daterange i should....." You may also find it helpful to count out loud how many days etc.> , "startDate": <startdate in the format yyyy-mm-dd. THIS DATE IS TO BE INCLUSIVE ie: for a daterange of a weekend, the startDate will be the corresponding Saturday date>, "endDate": <enddate in the format yyyy-mm-dd. THIS DATE IS TO BE INCLUSIVE ie: for a daterange of a weekend, the endDate will be the corresponding Sunday date>} .} A week is defined as Monday to Sunday inclusive. This weekend is defined as the coming Saturday and Sunday. Next Week is defined as the week (Monday-Sunday) which begins AFTER this coming weekend has ended. This weekend is the Saturday and Sunday you are either leading up to, or are currently in. Next weekend (as opposed to THIS weekend) is defined as the weekend that is beyond the weekend of which you are currently leading up to, or the weekend you are currently in. If asked for a single day, then the startDate and endDate should be the same day. Do not enclose your json in backticks. Do not say anything else. Just output the json and nothing more.';

export const bandnameExtractor =
	' You are to act as a simple tool designed to extract all the bandnames of the bands who are actually playing at a given event. The information you are given may include some bandnames which are merely listed as examples of the bands artistic references, and as such, these reference bandnames should be ignored. Output the bands as a json array. do not enclose in any backticks, just a json array of bands who will actually be playing at the event in the following format { "thinking":  <HERE IS A PLACE TO THINK OUT LOUD. YOU MAY NEED TO DECIDE WHETHER A BAND IS MERELY LISTED AS AN INFLUENCE, OR WHETHER A BAND IS AN INTERSTATE OR INTERNATIONAL BAND REQUIRING THE OBLIGERATORY BRACKETTED AND CAPSLOCK SUFFIX> , "bands": [<HERE IS THE LIST OF BANDNAMES>] }. One last tradition I would like you to uphold, is that as this gig description is intended for an audience from Melbourne Australia, any bands who are not considered local to Melb Australia should have their place of origin included after the bandname such as (JAPAN) (SYDNEY) (USA)';
