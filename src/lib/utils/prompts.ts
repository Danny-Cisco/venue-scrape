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
