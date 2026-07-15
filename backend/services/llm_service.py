import os
import json
import logging
import google.generativeai as genai
from config import Config

logger = logging.getLogger(__name__)

# Configure Google Gemini SDK
api_key = Config.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)
    logger.info("Google Gemini SDK configured successfully.")
else:
    logger.warning("GEMINI_API_KEY not found in environment. LLMService will use fallback rule-based reasoning.")

class LLMService:
    @staticmethod
    def plan_journey_details(goal_text):
        """
        Executes a single consolidated Gemini request to determine intent, 
        perform risk analysis, provide tailored advice, and generate compliance steps in one roundtrip.
        """
        # 1. Precise Fallback Mock Roadmaps (If no API Key or on Timeout/Error)
        fallback = {
            "is_bakery_intent": True,
            "risk_analysis": "Zoning & Compliance Check: Ensure the chosen commercial space is designated for food manufacturing. If operating in a residential zone, a change-of-land-use (CLU) certificate is required prior to municipal trade licensing. Fire safety compliance requires commercial LPG installation clearances.",
            "custom_advice": "For starting a bakery, your absolute first priority is Business Entity Registration to obtain a PAN Card, which acts as the anchor document for FSSAI registration and corporate banking.",
            "steps": []
        }

        # Check keywords for better fallback targeting
        is_bakery_keywords = ["bakery", "bake", "cake", "bread", "patisserie", "confectionery", "oven"]
        has_bakery_kw = any(kw in goal_text.lower() for kw in is_bakery_keywords)
        is_aadhar = any(kw in goal_text.lower() for kw in ["aadhar", "uidai", "aadhaar"])
        is_medical = any(kw in goal_text.lower() for kw in ["pharmacy", "medical", "drug", "chemist", "medicine"])
        is_salon = any(kw in goal_text.lower() for kw in ["salon", "parlour", "spa", "hair", "beauty"])

        if is_aadhar:
            fallback["is_bakery_intent"] = False
            fallback["risk_analysis"] = "Biometric Verification Requirement: Aadhaar updates require active mobile number association for OTP verification. Mandatory biometric renewal (iris/fingerprints) must be completed in-person at an Aadhaar Seva Kendra."
            fallback["custom_advice"] = "Your immediate next step is to gather official Proof of Identity (POI) and Proof of Address (POA) documents matching your desired corrections."
            fallback["steps"] = [
                {
                    "id": "prep_docs",
                    "title": "Gather Proof of Identity (POI) and Proof of Address (POA) Documents",
                    "description": "Collect valid and active identity and address proofs required for the Aadhaar renewal/update process. For the mandatory 10-year Aadhaar document update, both POI and POA are required to keep the demographic details accurate.",
                    "authority": "Unique Identification Authority of India (UIDAI)",
                    "estimated_time": 2,
                    "documents": ["PAN Card", "Passport", "Voter ID Card", "Ration Card", "Electricity Bill", "Bank Passbook"],
                    "dependencies": []
                },
                {
                    "id": "book_appointment",
                    "title": "Book Appointment at Aadhaar Seva Kendra (ASK)",
                    "description": "Book an online appointment through the official UIDAI portal to secure a slot at the nearest Aadhaar Seva Kendra.",
                    "authority": "Unique Identification Authority of India (UIDAI)",
                    "estimated_time": 1,
                    "documents": ["Aadhaar Number", "Mobile Number registered with Aadhaar"],
                    "dependencies": ["prep_docs"]
                },
                {
                    "id": "submit_request",
                    "title": "Submit Aadhaar Update Request and Pay Fee",
                    "description": "Fill out the Aadhaar Correction/Update Form and pay the processing fee (Rs. 50 for online/demographic updates, Rs. 100 for biometric updates) to generate an Update Request Number (URN).",
                    "authority": "Unique Identification Authority of India (UIDAI)",
                    "estimated_time": 1,
                    "documents": ["Aadhaar Update Form", "Proof of Identity (POI) Document", "Proof of Address (POA) Document"],
                    "dependencies": ["book_appointment"]
                },
                {
                    "id": "biometric_verification",
                    "title": "Complete Biometric and Document Verification",
                    "description": "Visit the selected Aadhaar Seva Kendra (ASK) on the scheduled appointment date for mandatory biometric re-verification (fingerprints, iris scan, and photograph) and verification of original physical documents.",
                    "authority": "Unique Identification Authority of India (UIDAI)",
                    "estimated_time": 1,
                    "documents": ["Original Proof of Identity (POI)", "Original Proof of Address (POA)", "Aadhaar Update Receipt / Appointment Slip"],
                    "dependencies": ["submit_request"]
                },
                {
                    "id": "uidai_processing",
                    "title": "UIDAI Backend Processing and Validation",
                    "description": "UIDAI back-end systems verify the submitted biometric data and supporting documents. The processing status can be tracked online using the Update Request Number (URN).",
                    "authority": "Unique Identification Authority of India (UIDAI)",
                    "estimated_time": 30,
                    "documents": ["Update Request Number (URN)"],
                    "dependencies": ["biometric_verification"]
                },
                {
                    "id": "download_eaadhar",
                    "title": "Download Renewed/Updated e-Aadhaar",
                    "description": "Once the update request is approved, download the digitally signed, renewed electronic Aadhaar card (e-Aadhaar) from the myAadhaar portal.",
                    "authority": "Unique Identification Authority of India (UIDAI)",
                    "estimated_time": 1,
                    "documents": ["Aadhaar Number", "Registered Mobile Number (for OTP verification)"],
                    "dependencies": ["uidai_processing"]
                }
            ]
        elif is_medical:
            fallback["is_bakery_intent"] = False
            fallback["risk_analysis"] = "Drug Retail Regulations: Retailing pharmaceuticals requires a valid registered pharmacist on duty at all times. The premises must satisfy strict storage layout rules (including refrigeration storage)."
            fallback["custom_advice"] = "Your absolute first requirement is registering a legal business entity to secure a PAN card, which is mandatory for the drug license application."
            fallback["steps"] = [
                {
                    "id": "biz_reg",
                    "title": "Business Entity Registration",
                    "description": "Establish a legal entity (Sole Proprietorship/Partnership/LLP) and get a PAN card.",
                    "authority": "Registrar of Companies / Local Authority",
                    "estimated_time": 7,
                    "documents": ["Aadhaar Card", "Owner PAN Card", "Office Address Proof"],
                    "dependencies": []
                },
                {
                    "id": "drug_license",
                    "title": "State Drug License Registration",
                    "description": "Obtain a drug sales license from the State Drug Control Department to retail medicines.",
                    "authority": "State Drug Control Department",
                    "estimated_time": 25,
                    "documents": ["Business PAN", "Rent Agreement", "Pharmacist Registration Certificate", "Layout Plan of Shop"],
                    "dependencies": ["biz_reg"]
                },
                {
                    "id": "bank_acc",
                    "title": "Business Bank Account Setup",
                    "description": "Open a current account under your registered business name to handle financial transactions.",
                    "authority": "Commercial Bank (e.g. SBI, HDFC)",
                    "estimated_time": 3,
                    "documents": ["Entity Certificate", "PAN Card of Business", "Address Proof of Business"],
                    "dependencies": ["biz_reg"]
                },
                {
                    "id": "gst_reg",
                    "title": "GST Registration",
                    "description": "Register for GST to legally sell pharmaceuticals and claim tax credits.",
                    "authority": "GSTN / Indirect Tax Department",
                    "estimated_time": 5,
                    "documents": ["Business PAN", "Drug License", "Cancelled Cheque", "Address Proof"],
                    "dependencies": ["drug_license", "bank_acc"]
                },
                {
                    "id": "trade_license",
                    "title": "Municipal Shop and Trade License",
                    "description": "Acquire the municipal clearance to run a commercial chemist establishment locally.",
                    "authority": "Local Municipal Corporation",
                    "estimated_time": 15,
                    "documents": ["Rent Agreement", "NOC from Landlord", "Firms registration", "GST Details"],
                    "dependencies": ["gst_reg"]
                }
            ]
        elif is_salon:
            fallback["is_bakery_intent"] = False
            fallback["risk_analysis"] = "Salon Sanitation NOC: Local municipal laws require specialized drainage and cosmetic waste disposal. Verify commercial water connection availability."
            fallback["custom_advice"] = "Begin with local shop establishment registration to legally lease commercial retail space."
            fallback["steps"] = [
                {
                    "id": "biz_reg",
                    "title": "Business Entity Registration",
                    "description": "Establish a legal entity (Sole Proprietorship or Partnership) to open commercial operations.",
                    "authority": "Local Registrar / Registrar of Companies",
                    "estimated_time": 7,
                    "documents": ["Aadhaar Card", "PAN Card", "Business Address Proof"],
                    "dependencies": []
                },
                {
                    "id": "bank_acc",
                    "title": "Current Bank Account",
                    "description": "Open a business bank account to execute commercial payment transactions.",
                    "authority": "Commercial Bank",
                    "estimated_time": 3,
                    "documents": ["Business Registration Certificate", "Business PAN", "Address Proof"],
                    "dependencies": ["biz_reg"]
                },
                {
                    "id": "shop_establishment",
                    "title": "Shop & Establishment Act License",
                    "description": "Register the salon under the state labor department's Shop Act detailing hours and employee counts.",
                    "authority": "State Labour Department",
                    "estimated_time": 7,
                    "documents": ["Photo of Shop Front", "Employer Aadhaar", "Rent Agreement"],
                    "dependencies": ["biz_reg"]
                },
                {
                    "id": "gst_reg",
                    "title": "GST Registration",
                    "description": "Obtain GST registration to claim input tax on cosmetics and billing customers legally.",
                    "authority": "GSTN Department",
                    "estimated_time": 5,
                    "documents": ["Business PAN", "Shop License", "Cancelled Cheque"],
                    "dependencies": ["shop_establishment", "bank_acc"]
                },
                {
                    "id": "municipal_trade",
                    "title": "Municipal Trade License",
                    "description": "Apply for local health trade permission from the municipal board for beauty and cosmetic sanitation compliance.",
                    "authority": "Local Municipal Health Board",
                    "estimated_time": 15,
                    "documents": ["Rent Deed", "Water Connection Bill", "Shop Act License", "Medical certificate of staff"],
                    "dependencies": ["gst_reg"]
                }
            ]
        elif not has_bakery_kw:
            # Generic dynamic startup business fallback
            fallback["is_bakery_intent"] = False
            fallback["risk_analysis"] = "Dynamic Compliance Alert: We are generating a custom administrative checklist for your business. Verify local commercial licensing rules. Ensure municipal clearance is obtained prior to operations."
            fallback["custom_advice"] = "For this business type, you must begin with Business Entity Registration to establish a legal identity for bank account creation."
            fallback["steps"] = [
                {
                    "id": "biz_reg",
                    "title": "Business Entity Registration",
                    "description": f"Formally register your startup/business for '{goal_text}' to secure legal status.",
                    "authority": "Ministry of Corporate Affairs / Local Registrar",
                    "estimated_time": 7,
                    "documents": ["Aadhaar Card", "PAN Card of Promoter", "Business Address NOC"],
                    "dependencies": []
                },
                {
                    "id": "bank_acc",
                    "title": "Commercial Current Account",
                    "description": "Create a corporate bank account to channel all commercial inflows and payments.",
                    "authority": "Commercial Bank",
                    "estimated_time": 3,
                    "documents": ["PAN Card of Business", "Entity Registration Certificate"],
                    "dependencies": ["biz_reg"]
                },
                {
                    "id": "shop_license",
                    "title": "Shop and Establishment Registration",
                    "description": "Register your physical/office workplace with the state labour department.",
                    "authority": "State Labour Commissioner",
                    "estimated_time": 5,
                    "documents": ["Aadhaar Card", "Rental Deed", "Commercial Space Electricity Bill"],
                    "dependencies": ["biz_reg"]
                },
                {
                    "id": "gst_registration",
                    "title": "GST Registration Certificate",
                    "description": "Obtain a GST identification number to collect trade taxes and operate legally.",
                    "authority": "GSTN Authority",
                    "estimated_time": 5,
                    "documents": ["Business PAN", "Shop License Certificate", "Cancelled Cheque"],
                    "dependencies": ["shop_license", "bank_acc"]
                },
                {
                    "id": "municipal_permit",
                    "title": "Local Municipal Trade NOC",
                    "description": "Secure the final commercial permit from local municipal officers to run operations.",
                    "authority": "Local Municipal Board / Corporation",
                    "estimated_time": 10,
                    "documents": ["GST Registration", "Rental Agreement", "No-Objection Certificate from Landlord"],
                    "dependencies": ["gst_registration"]
                }
            ]

        if not api_key:
            logger.info("Using fallback dynamic roadmap (no GEMINI_API_KEY).")
            return fallback

        try:
            model = genai.GenerativeModel("gemini-flash-latest")
            
            prompt = f"""
            You are the JanSaarthi AI Administrative Planner. Your goal is to map a citizen's goal into a structured compliance path in India.
            
            Citizen's Goal: "{goal_text}"
            
            Perform the following reasoning:
            1. is_bakery_intent: true if the goal relates to starting a bakery, bread making, baking, or cake shop. Otherwise false.
            2. risk_analysis: Zoning warnings, safety concerns, environmental codes, or housing NOCs based on the business type and scale.
            3. custom_advice: Short, tailored text advising them on their first immediate action.
            4. steps: If is_bakery_intent is true, return an empty steps list []. If false, construct a Directed Acyclic Graph (DAG) of the 5-6 compliance/registration steps needed to achieve this goal under Indian laws.
               Each step in the steps array MUST contain:
               - "id": unique lowercase alphanumeric slug (e.g. "biz_reg", "drug_license").
               - "title": certificate/license name (e.g. "Drug Retail License").
               - "description": clear explanation of application process and requirements.
               - "authority": Indian government body responsible (e.g. "Unique Identification Authority of India", "State Drug Controller").
               - "estimated_time": integer (number of processing days).
               - "documents": list of string document requirements.
               - "dependencies": list of other step IDs that must be completed before applying for this step (first step must have no dependencies). Ensure no circular dependency loops exist!
               
            Respond strictly in a single, valid JSON block. Do not include markdown code blocks.
            JSON Schema:
            {{
              "is_bakery_intent": boolean,
              "risk_analysis": "string",
              "custom_advice": "string",
              "steps": [
                {{
                  "id": "slug",
                  "title": "step title",
                  "description": "step description",
                  "authority": "authority name",
                  "estimated_time": number,
                  "documents": ["doc1", "doc2"],
                  "dependencies": ["dep_slug1", "dep_slug2"]
                }}
              ]
            }}
            """
            
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            if text.startswith("```"):
                lines = text.split("\n")
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    text = "\n".join(lines[1:-1]).strip()
            
            logger.info(f"Consolidated Gemini response: {text}")
            result = json.loads(text)
            
            # Basic validation
            if "is_bakery_intent" not in result or "risk_analysis" not in result or "custom_advice" not in result or "steps" not in result:
                raise KeyError("Missing core keys in consolidated response.")
                
            return result
        except Exception as e:
            logger.error(f"Consolidated Gemini planning failure ({e}). Falling back to rule-based defaults.")
            return fallback

    @staticmethod
    def answer_question(goal_text, step_title, step_description, question):
        """
        Answers user administrative compliance questions in context of their active step and goal.
        """
        fallback_answer = (
            f"Regarding your query about '{step_title}' for your goal '{goal_text}': "
            f"Please ensure you gather all required documents as shown in the checklist. "
            f"You can apply by visiting the digital portal or local office of the relevant authority. "
            f"For detailed legal queries, consult a local corporate compliance expert. "
            f"(Note: Setting a GEMINI_API_KEY in the environment enables specific, live answers to your questions!)"
        )

        if not api_key:
            logger.info("Using chatbot fallback message (no GEMINI_API_KEY).")
            return fallback_answer

        try:
            model = genai.GenerativeModel("gemini-flash-latest")
            
            prompt = f"""
            You are the JanSaarthi AI Compliance Assistant. A citizen is executing their administrative roadmap.
            Stated Business Goal: "{goal_text}"
            
            They are currently on this step:
            Step Name: "{step_title}"
            Step Details: "{step_description}"
            
            They have asked the following question about this step:
            "{question}"
            
            Provide a concise, practical, and helpful answer. Explain the required documents, typical fees if applicable under general Indian administrative regulations, and clear, actionable digital or physical steps to execute this.
            Keep your response under 150 words. Avoid generic fluff. Be helpful and professional.
            """
            
            response = model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini chat response failed ({e}). Returning fallback.")
            return fallback_answer
