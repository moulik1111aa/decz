import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ChatApp from "./message_print";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const socket = io.connect("http://localhost:3002", {
    withCredentials: true,
    extraHeaders: {
        "Access-Control-Allow-Origin": "http://localhost:3000 http://localhost:57886"
    }
});

const SuccessPage = () => (
    <div style={{ fontWeight: 'bold' }}>Your data has been recorded</div>
);


const ResponseForm_1 = ({ responseData }) => {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [instructions, setInstructions] = useState([]);
    const  [resp,setResp]=useState(null)
    const [responses, setResponses] = useState([]);
    const [sum ,setSum]=useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [requestCount, setRequestCount] = useState(0);
    const [formChanged, setFormChanged] = useState(false);
    const [consolePrinted, setConsolePrinted] = useState(false);
    const Print_error = ({ resp },i) => {
        let errorObject;
        const respString = resp;
        const respObject = JSON.parse(respString.replace(/'/g,'"'));
        socket.emit("data_stop",respObject)
        console.log(respObject.error);
        console.log(resp)
        
        try {
            errorObject = JSON.parse(resp);
            console.log(resp)
        } catch (error) {
            errorObject = null;
        }
    
        if(respObject.error!=0){
            
        return (
            <div>
                {errorObject ? (
                    <div>
                        Error: {errorObject.error}, Value: {errorObject.value}
                    </div>
                ) : (
                        <div>
                        {respObject.error}
                        </div>
                )}
            </div>
        );
    }};
    let field=[]
    let instruction_r=[]
    let response_val=[]
   

    useEffect(() => {
        socket.on('form_to', (receivedInstructions) => {
            try {
                let instructionsArray = [];
                if (Array.isArray(receivedInstructions)) {
                    instructionsArray = receivedInstructions;
                } else if (typeof receivedInstructions === 'object' && receivedInstructions !== null) {
                    instructionsArray = Object.values(receivedInstructions);
                }
                setInstructions(instructionsArray);
                console.log(receivedInstructions)
            } catch (error) {
                console.error("Error parsing instructions:", error);
            }
        });
    
        return () => {
            socket.off('form_data_to');
        };
    }, []);
     
    let arr=[]

    
    const RunGeminiValidation = async () => {
        const requestLimit = 5; // Set your request limit here
        const requestDelay = 2000; // Set your request delay in milliseconds here
        let requestCount = 0;
        const aa = Object.keys(formData).join(', ');
        const cc = Object.values(formData).join(', ');
        const aaArray = aa.split(', ');
        const ccArray = cc.split(', ');
    
        console.log(aaArray) 
        console.log(instructions)
        console.log(ccArray)
         try {
             const API_KEY = "AIzaSyBwFgfjgDkdrPYOYAdsqx-vIRxtpyERZGI"; 
             const genAI = new GoogleGenerativeAI(API_KEY);
             const model = await genAI.getGenerativeModel({ model: "gemini-pro" });    
             const generationConfig = {
                 temperature: 1,
                 topK: 1,
                 topP: 1,
                 maxOutputTokens: 2048,
                 stopSequences: [
                     "#",
                 ],
             };
             for(let m=0;m<aaArray.length;m++){
             console.log("iteration:",m)
             const parts = [
                 {text: "you are a form input validator who will get inputs like form field name, form field description or format and the value submitted by the actual user. You are supposed to return the value in the desired format if possible, if the value cannot be formatted then show an error which is the reason why input data is incorrect or cannot be mapped into the desired format"},
                 {text: "input: date, date should be in ddmmyy format, 5 May 2002"},
                 {text: "output: {'error': 0, 'value': 050502}#"},
                 {text: "input: date, date should be in ddmmyy format, 5 May"},
                 {text: "output: {'error': \"year is missing\" , 'value': 0}#"},
                 {text: "input: Email, Email should be in the form of @gmail.com format, moulik@gmail.com"},
                 {text: "output: {'error': 0, 'value': \"moulik@gmail.com\"}#"},
                 {text: "input: Email, Email should be in the form of @gmail.com format, moulik@yahoo.com"},
                 {text: "output: {'error': \"yahoo mail is given instead of gmail\" , 'value': 0}#"},
                 {text: "input: Contact, Contact number should be in the form of 10 digits, 7999176777"},
                 {text: "output: {'error': 0, 'value': 7999176777 }#"},
                 {text: "input: Contact, Contact number should be in the form of 10 digits, 799917677"},
                 {text: "output: {'error': \"Contact number is only 9 digits long\" , 'value': 0}#"},
                 {text: "input: Name, Name should contain surname and first name both, Moulik Anand"},
                 {text: "output: {'error': 0, 'value': \"Moulik Anand\"}#"},
                 {text: "input: Name, Name should contain surname and first name both, Moulik"},
                 {text: "output: {'error': \"Surname or first name is missing\" , 'value': 0}#"},
                 {text: "input: Gender, Gender should be male or female, male"},
                 {text: "output: {'error': 0, 'value': \"male\"}#"},
                 {text: "input: Gender, Gender should be male or female, binary"},
                 {text: "output: {'error': \"gender can only be male or female\" , 'value': 0}#"},
                 {text: "input: Section, Section can be A or B or C, C"},
                 {text: "output: {'error': 0, 'value': \"C\"}#"},
                 {text: "input: Section, Section can be A or B or C, D"},
                 {text: "output: {'error': \"Section can only be A or B or C\" , 'value': 0}#"},
                 {text: "input: Name, Name should have first letter capital for surname and first name, moulik Anand"},
                 {text: "output: {'error': 0 , 'value': \"Moulik Anand\"}#"},
                 {text: "input: Name, Name should have first letter capital for surname and first name, moulik anand"},
                 {text: "output: {'error': 0 , 'value': \"Moulik Anand\"}#"},
                 {text: "input: Name, Name should have first letter capital for surname and first name, Moulik Anand"},
                 {text: "output: {'error': 0 , 'value': \"Moulik Anand\"}#"},
                 {text: "input: date, date should be in ddmmyyyy format, 5 May 2002"},
                 {text: "output: {'error': 0, 'value': 05052002}#"},
                 {text: "input: date, date should be in dd/mm/yyyy format, 5 May 2002"},   
                 {text: "output: {'error': 0, 'value': 05/05/2002}#"},
                 {text: "input: date, date should be between 2001 and 2004, 5 May 2005"},
                 {text: "output: {'error': \"Date can only be in between 2001 and 2004\" , 'value': 0}#"},
                 {text: "input: Age, Age should be formatted in months, 11 years"},
                 {text: "output: {'error': 0, 'value': 132}#"},
                 {text: "input: Age, Age should be formatted in months, 11.5 years"},
                 {text: "output: {'error': 0, 'value': 138}#"},
                 {text: "input: Marks Obtained, Marks obtained should be out of 100, 78"},
                 {text: "output: {'error': 0, 'value': 78}#"},
                 {text: "input: Marks Obtained, Marks obtained should be out of 100, 113"},
                 {text: "output: {'error': \"Marks cannot be more than 100\" , 'value': 0}#"},
                 {text: "input: City, City should be from India only,  Indore"},
                 {text: "output: {'error': 0, 'value': \"Indore\"}#"},
                 {text: "input: City, City should be from India only,  Paris"},
                 {text: "output: {'error': \"Paris is not an Indian City\" , 'value': 0}#"},
                 {text: "input:" + aaArray[m] + ', ' + instructions[m+1] + ', ' + ccArray[m]},
                 {text: "output: "},
               ];
            
             console.log(parts)
             const safetySettings = [
                 {
                     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                 },
                 {
                     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                 },
                 {
                     category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                 },
                 {
                     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                 },
             ];
 
             const result = await model.generateContent({
                 contents: [{ role: "user", parts }],
                 generationConfig,
                 safetySettings,
             });
           
             const response = await result.response.text();
        console.log(response);

        setResponses((prevResponses) => ({
            ...prevResponses,
            [m]: response, // Store response with its index
        }));
         } 
         } catch (error) {
             console.error("Gemini Model Error:", error);
             throw new Error("Error in Gemini model");
         }
   
     }

    const Handleclick = async (e) => {
        e.preventDefault();
        const isValid = await validateEntries();
        if (isValid) {
            const stringifiedData = JSON.stringify(formData);
            console.log('Form Data:', stringifiedData);
            socket.emit("data", formData);
            await RunGeminiValidation()
        
        }
    };

    const handleChange = (e, fieldName) => {
        const { value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [fieldName]: value,
        }));
        setFormChanged(true); // Set formChanged to true when form data changes
    };
    const validateEntries = async () => {
        try {
            return true; 
        } catch (error) {
            setError("Error in validation: " + error.message);
            return false;
        }
    };
   
    useEffect(() => {
        if (responses.length > 0 && !consolePrinted) {
            console.log(responses);
            setConsolePrinted(true); // Set consolePrinted to true after printing console statements
        }
    }, [responses, consolePrinted]);
    
    return (
        <div>
            {success ? <SuccessPage /> : (
                <form>
                    {responseData && Object.keys(responseData).map((key, index) => (
                        <div key={key} className="input-container">
                            <label htmlFor={responseData[key].fieldName} className="label">
                                {responseData[key].fieldName}
                            </label>
                            <input
                                type="text"
                                id={responseData[key].fieldName}
                                name={responseData[key].fieldName}
                                value={formData[responseData[key].fieldName] || ''}
                                onChange={(e) => handleChange(e, responseData[key].fieldName)}
                            /> 
                            <div className="underline"></div>  
                            {responses[index] && <Print_error resp={responses[index]} i={index}/>}
                            <div></div>                   
                        </div>
                    ))}
                    <div className="form-button-container">
                        <button className="button" onClick={Handleclick}>Submit</button>
                       
                    </div>
                </form>
            )}
        </div>
    );
};
export default ResponseForm_1