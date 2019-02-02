/* This code has been generated from your interaction model by skillinator.io

/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the contents as the code for a new Lambda function, using the alexa-skill-kit-sdk-factskill template.
// This code includes helper functions for compatibility with versions of the SDK prior to 1.0.9, which includes the dialog directives.



// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function


let speechOutput;
let reprompt;
let welcomeOutput = "Welcome to My Subject Quiz. Say 'Start Quiz' to begin";
let welcomeReprompt = "sample re-prompt text";


// 2. Skill Code =======================================================================================================
"use strict";
const Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Question';
const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var quesList;
speechOutput = '';

var myMap = new Map();
myMap.set(0, "A");
myMap.set(1, "B");
myMap.set(2, "C");
myMap.set(3, "D");
myMap.set(4, "E");


var subMap = new Map();
subMap.set("1", "social");
subMap.set("2", "science");
subMap.set("3", "maths");
subMap.set("4", "english");
subMap.set("5", "hindi");


const handlers = {
    'LaunchRequest': function() {
        this.emit(':ask', welcomeOutput, welcomeReprompt);
    },
    'AMAZON.HelpIntent': function() {
        speechOutput = 'Placeholder response for AMAZON.HelpIntent.';
        reprompt = '';
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        quesList = [];
        speechOutput = 'Thank you. Will Play again soon';
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function() {
        quesList = [];
        speechOutput = 'Thank you. Will Play again soon';
        this.emit(':tell', speechOutput);
    },
    'SessionEndedRequest': function() {
        speechOutput = '';
        quesList = [];
        //this.emit(':saveState', true);//uncomment to save attributes to db on session end
        this.emit(':tell', speechOutput);
    },
    'AMAZON.NavigateHomeIntent': function() {
        speechOutput = '';

        //any intent slot variables are listed here for convenience


        //Your custom intent handling goes here
        speechOutput = "This is a place holder response for the intent named AMAZON.NavigateHomeIntent. This intent has no slots. Anything else?";
        this.emit(":ask", speechOutput, speechOutput);
    },
    'AMAZON.FallbackIntent': function() {
        speechOutput = '';

        //any intent slot variables are listed here for convenience
       //Your custom intent handling goes here
        speechOutput = "This is a place holder response for the intent named AMAZON.FallbackIntent. This intent has no slots. Anything else?";
        this.emit(":ask", speechOutput, speechOutput);
    },
    'Begin': function() {
        speechOutput = '';

        //Your custom intent handling goes here
        speechOutput += `Choose the Subject <break time="1s"/> 1.  Social <break time="1s"/> 	2.  Science <break time="1s"/>			3. English <break time="1s"/>	4.  Maths <break time="1s"/> 5.  Hindi`;
        this.emit(":ask", speechOutput, speechOutput);
    },
    'ServiceChoice': function() {
        speechOutput = '';

        let optionSlotRaw = this.event.request.intent.slots.option.value;
		console.log(optionSlotRaw);
		let optionSlot = resolveCanonical(this.event.request.intent.slots.option);
		console.log(optionSlot);
		
        var subCat = subMap.get(optionSlot);
        this.attributes.subject = subCat;

        var params = {
            TableName: TABLE_NAME,
            // ProjectionExpression: "sectionName,subSectionCNT",
            FilterExpression: "#category = :subCat",
            ExpressionAttributeNames: {
                "#category": "category"
            },
            ExpressionAttributeValues: {
                ":subCat": subCat //sectionID
            },
        };
        console.log(params);
        var iAnswer;
        documentClient.scan(params).promise()
            .then(data => {

                var questionCount = data.Count;
                var randomQuestion = Math.floor(Math.random() * questionCount);
                if(randomQuestion === 0) { randomQuestion = Math.floor(Math.random() * questionCount); }
                var listQuestion = data.Items;
                setQuestions(listQuestion);

                var answerList = quesList[randomQuestion].answers;
                var answerlenght = Object.keys(answerList).length;
                //session variables

                this.attributes.currentIndex = 1; //current Question number
                this.attributes.score = 0; // current score
                this.attributes.correct = quesList[randomQuestion].correct; //currect question Option like A,B,C
                this.attributes.answer = answerList[quesList[randomQuestion].correct]; //current question answer
                this.attributes.totalQ = questionCount; //TOTAL NUMBER OF QUESTION

                speechOutput = `You choose ${quesList[randomQuestion].category}.<break time="1s"/>.  <prosody rate="slow"> First question <break time="1s"/> ${quesList[randomQuestion].question}<break time="1s"/> Choose your Answer`;
                for (iAnswer = 0; iAnswer < answerlenght; iAnswer++) {
                    speechOutput += `<break time="1s"/> Answer ${myMap.get(iAnswer)} is  ${answerList[myMap.get(iAnswer)]}`;
                }
                speechOutput += "</prosody>";

                this.emit(":ask", speechOutput, speechOutput);
            })
            .catch(err => {
                console.error(err);
            });
    },
    'AnswerChoice': function() {
        speechOutput = '';
        //Getting the session attributes values.
        var sessCorrect = this.attributes.correct;
        var sesscurrentIndex = this.attributes.currentIndex;
        var sesstotalQ = this.attributes.totalQ;
        var sessScore = this.attributes.score;
        var sessSubject = this.attributes.subject;
        var sessAnswer = this.attributes.answer;
        
        console.log("The current Index", sesscurrentIndex);
        console.log("The Correct", sessCorrect);
        console.log("Total Questions", sesstotalQ);
        console.log("Total Score ", sessScore);
        console.log("the answer", sessAnswer)
        

        let choiceSlotRaw = this.event.request.intent.slots.choice.value;
        console.log(choiceSlotRaw);
        let choiceSlot = resolveCanonical(this.event.request.intent.slots.choice);
        console.log(choiceSlot);
        
        //Check if the Answer is correct or not
        if (sessCorrect.toUpperCase() === choiceSlot.toUpperCase()) {
            sessScore++;
            speechOutput += `Correct,`;

        }
        else {
            speechOutput += `Incorrect, The correct answer is ${sessAnswer} <break time="1s"/>`;
        }

        //Check if this is the last question, else get the next question
        if (sesscurrentIndex == sesstotalQ) {
            speechOutput += `You answered ${sessScore} of ${sesscurrentIndex} questions`;
            this.emit(":tell", speechOutput, speechOutput);
        }
        else {
            var iAnswer;
            
            var randomQuestion = Math.floor(Math.random() * sesstotalQ);
            if(randomQuestion == 0) { randomQuestion = Math.floor(Math.random() * sesstotalQ); } 
            console.log("the questioncount", sesstotalQ)
            console.log("the random number", randomQuestion)
            var allQuestions = getQuestions();

            var answerList = allQuestions[randomQuestion].answers;
            var answerlenght = Object.keys(answerList).length;

            //session variables
            this.attributes.currentIndex = sesscurrentIndex + 1;
            this.attributes.score = sessScore;
            this.attributes.correct = allQuestions[randomQuestion].correct;
            this.attributes.answer = answerList[allQuestions[randomQuestion].correct]; 
            
           

            speechOutput += `<prosody rate="slow"> You're Score is ${sessScore} out of ${sesscurrentIndex}<break time="1s"/> Next Question  , <break time="1s"/> ${allQuestions[randomQuestion].question}<break time="1s"/> Choose your Answer`;
            for (iAnswer = 0; iAnswer < answerlenght; iAnswer++) {
                speechOutput += `<break time="1s"/> Answer ${myMap.get(iAnswer)} is  ${answerList[myMap.get(iAnswer)]} `;
            }
            speechOutput += "</prosody>";
            this.emit(":ask", speechOutput, speechOutput);

        }

    },
    'Unhandled': function() {
        speechOutput = "The skill didn't quite understand what you wanted.  Do you want to try something else?";
        this.emit(':ask', speechOutput, speechOutput);
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    //alexa.dynamoDBTableName = 'DYNAMODB_TABLE_NAME';//uncomment this line to save attributes to DB
    alexa.execute();
};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================
//set the list of question retreived
function setQuestions(listQuestion) {
    quesList = listQuestion;
}
//return the list of question retreived
function getQuestions() {
    return quesList;
}


function resolveCanonical(slot) {
    //this function looks at the entity resolution part of request and returns the slot value if a synonyms is provided
    let canonical;
    try {
        canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    }
    catch (err) {
        console.log(err.message);
        canonical = slot.value;
    };
    return canonical;
};

function delegateSlotCollection() {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
        console.log("in Beginning");
        let updatedIntent = null;
        // updatedIntent=this.event.request.intent;
        //optionally pre-fill slots: update the intent object with slot values for which
        //you have defaults, then return Dialog.Delegate with this updated intent
        // in the updatedIntent property
        //this.emit(":delegate", updatedIntent); //uncomment this is using ASK SDK 1.0.9 or newer

        //this code is necessary if using ASK SDK versions prior to 1.0.9 
        if (this.isOverridden()) {
            return;
        }
        this.handler.response = buildSpeechletResponse({
            sessionAttributes: this.attributes,
            directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
            shouldEndSession: false
        });
        this.emit(':responseReady', updatedIntent);

    }
    else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        // return a Dialog.Delegate directive with no updatedIntent property.
        //this.emit(":delegate"); //uncomment this is using ASK SDK 1.0.9 or newer

        //this code necessary is using ASK SDK versions prior to 1.0.9
        if (this.isOverridden()) {
            return;
        }
        this.handler.response = buildSpeechletResponse({
            sessionAttributes: this.attributes,
            directives: getDialogDirectives('Dialog.Delegate', null, null),
            shouldEndSession: false
        });
        this.emit(':responseReady');

    }
    else {
        console.log("in completed");
        console.log("returning: " + JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent;
    }
}


function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    let i = 0;
    i = Math.floor(Math.random() * array.length);
    return (array[i]);
}

function isSlotValid(request, slotName) {
    let slot = request.intent.slots[slotName];
    //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
    let slotValue;

    //if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        //we have a value in the slot
        slotValue = slot.value.toLowerCase();
        return slotValue;
    }
    else {
        //we didn't get a value in the slot.
        return false;
    }
}

//These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
//will be removed once Lambda templates are updated with the latest SDK

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    }
    else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    let alexaResponse = {
        shouldEndSession: options.shouldEndSession
    };

    if (options.output) {
        alexaResponse.outputSpeech = createSpeechObject(options.output);
    }

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.directives) {
        alexaResponse.directives = options.directives;
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if (options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if (options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if (options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    }
    else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    }
    else if (options.cardType === 'AskForPermissionsConsent') {
        alexaResponse.card = {
            type: 'AskForPermissionsConsent',
            permissions: options.permissions
        };
    }

    let returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
    let directive = {
        type: dialogType
    };

    if (dialogType === 'Dialog.ElicitSlot') {
        directive.slotToElicit = slotName;
    }
    else if (dialogType === 'Dialog.ConfirmSlot') {
        directive.slotToConfirm = slotName;
    }

    if (updatedIntent) {
        directive.updatedIntent = updatedIntent;
    }
    return [directive];
}
