import requests
import re

url = "https://tagger.scryfall.com/card/c20/173"
query = "query FetchCard($set:String! $number:String! $back:Boolean=false $moderatorView:Boolean=false){card:cardBySet(set:$set number:$number back:$back){...CardAttrs backside layout scryfallUrl sideNames twoSided rotatedLayout taggings(moderatorView:$moderatorView){...TaggingAttrs tag{...TagAttrs ancestorTags{...TagAttrs}}}relationships(moderatorView:$moderatorView){...RelationshipAttrs}}}fragment CardAttrs on Card{artImageUrl backside cardImageUrl collectorNumber id illustrationId name oracleId printingId set}fragment RelationshipAttrs on Relationship{classifier classifierInverse annotation subjectId subjectName createdAt creatorId foreignKey id name pendingRevisions relatedId relatedName status type}fragment TagAttrs on Tag{category createdAt creatorId id name namespace pendingRevisions slug status type}fragment TaggingAttrs on Tagging{annotation subjectId createdAt creatorId foreignKey id pendingRevisions type status weight}"

payload = {
"query": query,
"variables":{
    "set": "c20",
    "number": "173",
    "back": False,
    "moderatorView": False  
    }
}

x = requests.get(url)

print(x.headers)
r_scryfall_tagger_session = '_scryfall_tagger_session=([^;]+)'
sessionToken = re.search(r_scryfall_tagger_session, str(x.headers)).group(1)

cookies = { '_scryfall_tagger_session': sessionToken }
print(cookies)


regex = 'csrf-token.*content=\"([^"]+)\"'

csrfToken = re.search(regex, x.text)
token = csrfToken.group(1)

postUrl = 'https://tagger.scryfall.com/graphql'
my_headers = {"X-Csrf-Token" : token,
              "Cookie": '_scryfall_tagger_session=' + sessionToken}

my_headers = {
    'Content-Type': 'application/json',
    'Cookie': '_scryfall_tagger_session=' + sessionToken,
    'Content-Type': 'application/json',
    'Content-Length': '1050',
    'Host': 'tagger.scryfall.com',
    'Origin': 'https://tagger.scryfall.com',
    'Referer': 'https://tagger.scryfall.com/card/c20/173',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'X-Csrf-Token': token}
        #      "Authorization": "Bearer ",
        #      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' }
postResponse = requests.post(postUrl, json=payload, headers=my_headers)

print("postResponse:")
print(postResponse.text)
