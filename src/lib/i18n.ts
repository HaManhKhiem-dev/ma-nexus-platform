import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const resources = {
  "en": {
    "translation": {
      "admin": {
        "access_denied": "Access Denied",
        "access_denied_description": "Only compliance admins can access this dashboard.",
        "approve": "Approve",
        "approve_kyc": "Approve KYC",
        "command_center": "Command Center",
        "description": "Review KYC submissions, inspect documents, and approve verified workspace access.",
        "document_preview": "Document Preview",
        "file_number": "File {{index}}",
        "full_size_kyc_document": "Full-size KYC document",
        "kyc_document_alt": "KYC document",
        "kyc_submitted_file": "Submitted KYC file",
        "live_queue": "Live Queue",
        "member": "Member",
        "mock_verified": "Mock verified",
        "no_documents": "No documents",
        "no_email": "No email",
        "no_match_description": "Try adjusting your search query.",
        "no_matching_records": "No matching records",
        "pending": "Pending",
        "pending_count": "{{count}} pending",
        "pending_kyc_reviews": "Pending KYC Reviews",
        "queue_clear": "Queue Clear",
        "queue_clear_description": "No pending KYC submissions are waiting for review.",
        "refresh": "Refresh",
        "reject": "Reject",
        "reject_kyc": "Reject KYC",
        "restricted_area": "Restricted Area",
        "review_error": "Review action failed.",
        "role_country": "{{role}} / {{country}}",
        "search_placeholder": "Search users, email, role...",
        "stats": {
          "files_attached": "Files Attached",
          "pending_reviews": "Pending Reviews",
          "profiles_with_documents": "Profiles With Documents",
          "ready_to_inspect": "Ready To Inspect",
          "submitted_documents": "Submitted Documents",
          "users_waiting": "Users Waiting"
        },
        "table": {
          "actions": "Actions",
          "documents": "Documents",
          "email": "Email",
          "role": "Role",
          "user": "User"
        },
        "title": "Admin Dashboard",
        "unnamed_user": "Unnamed User",
        "view_document_image": "View document image"
      },
      "auth": {
        "access_key": "Access Key",
        "authorized_user": "Authorized",
        "back_to_home": "Back To Home",
        "back_to_register": "Back To Register",
        "confirm_account": "Confirm Account",
        "corporate_email": "Corporate Email",
        "enter_workspace": "Enter Workspace",
        "errors": {
          "email_already_in_use": "This email already exists.",
          "firestore_connection": "Firestore connection error.",
          "invalid_credentials": "Invalid login credentials.",
          "invalid_email": "Invalid email address.",
          "invalid_otp": "The verification code is incorrect.",
          "otp_send_failed": "Unable to send the verification code by email.",
          "system_error": "System error.",
          "unauthorized_domain": "This domain is not authorized in Firebase.",
          "weak_password": "Password must be at least 6 characters."
        },
        "full_name": "Full Name",
        "google_sso": "Google SSO",
        "or_continue_with": "Or Continue With",
        "otp_description": "Enter the verification code sent to {{email}}.",
        "otp_placeholder": "000000",
        "page_not_exist": "This Page Does Not Exist",
        "processing": "Processing...",
        "register_switch": "New Operator? Register",
        "route_not_found": "Route Not Found",
        "route_unavailable": "The route you requested is not available in this workspace.",
        "secure_access_only": "Secure Access Only",
        "secure_description": "Access is protected for verified investors, sellers, advisors, and compliance admins.",
        "send_verification": "Send Verification",
        "sign_in": "Sign In",
        "sign_in_before_accessing": "Please sign in before accessing this protected workspace.",
        "sign_in_required": "Sign In Required",
        "sign_in_switch": "Already Authorized? Sign In",
        "terminal": "NexusM&A Secure Terminal",
        "title_login": "Secure Access",
        "title_otp": "Verify Email",
        "title_register": "Create Account",
        "verification_code": "Verification Code",
        "otp_email_message": "This code will expire in a few minutes. Please do not share it with anyone."
      },
      "common": {
        "back": "Back",
        "cancel": "Cancel",
        "confidential": "Confidential",
        "done": "Done",
        "loading_initializing_nexus": "Initializing Nexus",
        "not_applicable": "N/A",
        "not_set": "Not set",
        "private": "Private",
        "required": "Required",
        "saving": "Saving...",
        "select_label": "Select {{label}}",
        "submitting": "Submitting...",
        "tba": "TBA",
        "unknown_error": "Unknown error"
      },
      "create_deal": {
        "alerts": {
          "kyc_seller_required": "KYC verification and seller/advisor role are required before submitting a deal.",
          "sign_in_required": "Please sign in before submitting a deal.",
          "submission_failed": "Deal submission failed."
        },
        "badge": "Seller Submission Protocol",
        "completion": "Completion",
        "completion_note": "Complete the required fields before submitting the asset for review.",
        "compliance_note": "Compliance Note",
        "compliance_text": "All submitted information is subject to admin review, audit logging, and controlled disclosure.",
        "deal_builder": "Deal Builder",
        "deal_types": {
          "fundraising": "Fundraising",
          "sell_100": "Sell 100%",
          "sell_equity": "Sell Equity"
        },
        "description": "Build a structured listing package for admin review, verified buyers, and controlled data-room release.",
        "document_demo_note": "This demo marks documents as selected. In production, connect this step to secure file upload and data-room indexing.",
        "document_prepared": "Mark this document as prepared for the diligence package.",
        "documents": {
          "business_license": "Business license",
          "financial_report": "Financial report",
          "legal_documents": "Legal documents",
          "pitch_deck": "Pitch deck",
          "shareholder_list": "Shareholder list"
        },
        "fields": {
          "country_registration": "Country of Registration",
          "deal_summary": "Deal Summary",
          "deal_title": "Deal Title",
          "deal_type": "Deal Type",
          "equity_offered": "Equity Offered",
          "esop_ownership": "ESOP Ownership",
          "founded_year": "Founded Year",
          "founder_ownership": "Founder Ownership",
          "future_plan": "Future Plan",
          "growth_rate": "Growth Rate",
          "industry": "Industry",
          "investor_ownership": "Investor Ownership",
          "legal_entity_name": "Legal Entity Name",
          "location": "Location",
          "net_profit": "Net Profit",
          "products_services": "Products & Services",
          "reason": "Strategic Reason",
          "revenue": "Revenue",
          "target_markets": "Target Markets",
          "tax_id": "Tax ID",
          "valuation": "Valuation"
        },
        "industries": {
          "consumer": "Consumer",
          "education": "Education",
          "financial_services": "Financial Services",
          "healthcare": "Healthcare",
          "logistics": "Logistics",
          "manufacturing": "Manufacturing",
          "technology": "Technology"
        },
        "last_three_years": "Last 3 Years",
        "locked_description": "Only verified sellers and advisors can submit assets into the private marketplace.",
        "locked_title": "Seller KYC Required",
        "next_step": "Next Step",
        "progress": "Progress",
        "snapshot": {
          "company": "Company",
          "deal_preview": "Deal Preview",
          "docs": "Docs",
          "docs_selected": "{{selected}}/{{total}} selected",
          "industry": "Industry",
          "live_snapshot": "Live Snapshot",
          "valuation": "Valuation"
        },
        "step_number": "Step {{step}}",
        "step_of_total": "Step {{step}} of {{total}}",
        "steps": {
          "deal_terms": {
            "description": "Transaction type, valuation, equity, and strategic rationale.",
            "short_title": "Terms",
            "title": "Deal Terms"
          },
          "documents": {
            "description": "Diligence package required for admin moderation.",
            "short_title": "Docs",
            "title": "Documents"
          },
          "financials": {
            "description": "Revenue, EBITDA, profit, and growth indicators.",
            "short_title": "Finance",
            "title": "Financials"
          },
          "legal_entity": {
            "description": "Company registration, ownership, and legal identity.",
            "short_title": "Legal",
            "title": "Legal Entity"
          },
          "operations": {
            "description": "Deal title, industry, location, products, and target markets.",
            "short_title": "Market",
            "title": "Operations"
          }
        },
        "submit_for_review": "Submit For Review",
        "title": "Submit New Deal",
        "year_number": "Year {{year}}"
      },
      "dashboard": {
        "action_items": "Action Items",
        "actions": {
          "awaiting_approval": "Awaiting Approval",
          "kyc_review": "KYC Review",
          "legal_milestone": "Legal Milestone",
          "nda_request": "NDA Request",
          "negotiation": "Negotiation",
          "new_message": "New Message",
          "profiles_pending": "Profiles Pending",
          "spa_draft_ready": "SPA Draft Ready"
        },
        "admin": {
          "all_identities_cleared": "All identities are cleared.",
          "anonymous": "Anonymous",
          "asset_moderation": "Asset Moderation",
          "asset_pipeline_empty": "Asset moderation queue is empty.",
          "description": "Admin command center for identity reviews and asset moderation.",
          "identity_verification": "Identity Verification",
          "lvl4_auth": "Level 4 Auth",
          "pending_count": "{{count}} pending",
          "priority_review": "Priority Review",
          "protocol": "Protocol",
          "reject": "Reject",
          "review_asset": "Review Asset",
          "verify": "Verify"
        },
        "audit": "Audit",
        "default_name": "Operator",
        "errors": {
          "deal_moderation_failed": "Deal moderation failed.",
          "firestore_rules_blocking_nda": "Firestore rules are blocking this NDA update.",
          "kyc_moderation_failed": "KYC moderation failed.",
          "nda_update_failed": "NDA update failed."
        },
        "explorer_marketplace": "Explore Marketplace",
        "footer": {
          "audit_desc": "Every action is logged for compliance inspection.",
          "compliance_desc": "KYC, NDA, and approval workflows stay enforceable.",
          "encrypted_desc": "Protected workflows for private market transactions.",
          "encrypted_infrastructure": "Encrypted Infrastructure",
          "global_compliance": "Global Compliance",
          "realtime_audit": "Realtime Audit"
        },
        "high_priority": "High Priority",
        "live_operations": "Live Operations",
        "messages": {
          "deal_moved": "Deal moved to {{status}}.",
          "kyc_status_for_user": "KYC marked as {{status}} for {{user}}.",
          "nda_approved": "NDA approved and signed.",
          "nda_rejected": "NDA request rejected."
        },
        "nda": {
          "asset_id": "Asset ID",
          "awaiting_counter_signature": "Awaiting counter-signature from seller.",
          "deny": "Deny",
          "execute_sign": "Execute Sign",
          "mutual_request": "Mutual NDA Request",
          "no_active_requests": "No active NDA requests.",
          "title": "NDA Control Queue",
          "watermarked_access_granted": "Watermarked data-room access granted."
        },
        "new_asset_listing": "New Asset Listing",
        "portfolio_health": "Portfolio Health",
        "stats": {
          "active_listings": "Active Listings",
          "pending_actions": "Pending Actions",
          "pipeline_value": "Pipeline Value",
          "signed_ndas": "Signed NDAs"
        },
        "title": "Command Dashboard",
        "valuation": "Valuation",
        "welcome_prefix": "Welcome back,",
        "welcome_suffix": "Your verified workspace is synced across deal flow, NDA requests, and compliance tasks."
      },
      "data_room": {
        "avg_session": "Avg Session",
        "back_to_listing": "Back To Listing",
        "bulk_upload": "Bulk Upload",
        "complete_verification": "Complete Verification",
        "directory_stack": "Directory Stack",
        "download_secure_file": "Download secure file",
        "folders": {
          "contracts": "Contracts",
          "financial": "Financial",
          "hr": "HR",
          "legal": "Legal",
          "technology": "Technology"
        },
        "identity": "identity",
        "locked_description_middle": "and signed",
        "locked_description_prefix": "Verified",
        "locked_description_suffix": "are required before accessing this vault.",
        "locked_title": "Data Room Locked",
        "permissions": {
          "download": "Download",
          "edit": "Edit",
          "view_only": "View only"
        },
        "policy": {
          "audit_text": "View and download actions are logged with user identity and deal context.",
          "audit_trail": "Audit Trail",
          "export_policy": "Export Policy",
          "export_text": "Sensitive files remain watermarked and permission-scoped.",
          "security": "Security",
          "security_text": "Role-based access, KYC gates, and NDA state checks protect every document."
        },
        "restricted_protocol": "Restricted Protocol",
        "return_to_market": "Return To Market",
        "search_placeholder": "Search files...",
        "secure_repository": "Secure Repository",
        "stats": {
          "audit_trail": "Audit Trail",
          "downloads": "{{count}} Downloads",
          "engagement": "Engagement",
          "exfiltration": "Exfiltration",
          "protection": "Protection",
          "views": "{{count}} Views",
          "watermarked": "Watermarked"
        },
        "title": "Data Room",
        "unknown_asset": "Unknown Asset",
        "vault_protected": "Vault Protected",
        "view_document": "View document",
        "watermark_prefix": "All views are watermarked to",
        "watermark_suffix": "Exports remain audit-tracked."
      },
      "deal_detail": {
        "access_actions": "Access Actions",
        "access_granted": "Access Granted",
        "access_requirement": "Access Requirement",
        "actions": {
          "bookmark": "Bookmark",
          "contact": "Contact",
          "meeting": "Book Meeting",
          "offer": "Submit Offer"
        },
        
        "ai_deal_intelligence": "AI Deal Intelligence",
        "ai_fallback": "AI summary is unavailable. Showing structured public deal information instead.",
        "alerts": {
          "cannot_request_nda": "Your account is not eligible to request NDA access.",
          "deal_info_missing": "Deal information is missing.",
          "enter_legal_name": "Please enter your legal name.",
          "no_sample_nda": "Sample deal NDA requests are disabled.",
          "real_deals_only": "NDA requests are only available for real deals.",
          "seller_invalid": "Seller information is invalid.",
          "seller_missing": "Seller information is missing.",
          "sign_in_to_request_nda": "Please sign in before requesting NDA access.",
          "sign_nda_failed": "Failed to sign NDA request."
        },
        "back_to_marketplace": "Back To Marketplace",
        "deal_control": "Deal Control",
        "default_summary": "This opportunity has verified public data and controlled private disclosure through NDA workflow.",
        "generating_summary": "Generating summary...",
        "kyc_required_first": "KYC Required First",
        "kyc_required_for_nda": "KYC is required before requesting NDA access.",
        "manage_nda_requests": "Manage NDA Requests",
        "metrics": {
          "ebitda": "EBITDA",
          "equity_offered": "Equity Offered",
          "revenue": "Revenue",
          "valuation": "Valuation"
        },
        "nda_modal": {
          "agree_sign": "Agree & Sign",
          "audit_notice": "Signing creates an audit log and sends the request to the seller.",
          "clause_confidential_text": "The recipient agrees to protect all non-public business, financial, legal, and technical information.",
          "clause_confidential_title": "Confidential Information",
          "clause_exclusions_text": "Information already public or independently developed is excluded from confidentiality obligations.",
          "clause_exclusions_title": "Exclusions",
          "clause_number": "Clause {{number}}",
          "clause_obligations_text": "The recipient may use disclosed information only for evaluating the proposed transaction.",
          "clause_obligations_title": "Recipient Obligations",
          "digital_signature_required": "Digital signature required",
          "intro": "Review the clauses below and type your legal name to sign the NDA request.",
          "name_placeholder": "Your legal name",
          "signing_securely": "Signing securely...",
          "title": "Mutual NDA Agreement",
          "type_legal_name": "Type Legal Name"
        },
        "nda_pending": "NDA Pending",
        "nda_request_pending": "NDA request pending",
        "nda_required": "NDA Required",
        "not_found": {
          "description": "The requested deal is unavailable or has been removed.",
          "eyebrow": "Deal Not Found",
          "title": "This Deal Does Not Exist"
        },
        "open_data_room": "Open Data Room",
        "private_content_available": "Private Content Available",
        "private_view": {
          "contracts": "Contracts",
          "corporate_records": "Corporate Records",
          "eyebrow": "Private Access",
          "full_financial_model": "Full Financial Model",
          "ip_documents": "IP Documents",
          "title": "Unlocked Diligence Materials"
        },
        "public_view": {
          "eyebrow": "Public Preview",
          "market_position": "Market Position",
          "market_position_default": "Positioned for strategic growth in its target segment.",
          "next_step": "Next Step",
          "next_step_text": "Complete KYC and sign NDA to access confidential materials.",
          "strategic_objective": "Strategic Objective",
          "strategic_objective_default": "Engage qualified investors through controlled disclosure.",
          "title": "Public Deal Snapshot"
        },
        "review_sign_nda": "Review & Sign NDA",
        "sample_deal": "Sample Deal",
        "scores": {
          "buyer_fit": "Buyer Fit",
          "growth": "Growth",
          "lower_better": "Lower is better",
          "match": "Match",
          "revenue_momentum": "Revenue Momentum",
          "risk": "Risk"
        },
        "security_status": "Security Status",
        "seller": {
          "kyc_license_records": "KYC and license records are attached to the account.",
          "listing_managed_by": "Listing managed by",
          "verified_seller_advisor": "Verified seller or advisor"
        },
        "sign_nda_to_request": "Sign NDA To Request Access",
        "strategic_summary": "Strategic Summary",
        "workflow": {
          "closing_archive": "Closing Archive",
          "esignature": "E-signature",
          "generate_nda": "Generate NDA",
          "negotiate_spa": "Negotiate SPA",
          "review_loi": "Review LOI",
          "title": "Legal Workflow"
        },
        investor_memo: {
            description:
              'This memo compares the deal against your investment profile, target ticket size, risk appetite, and strategic preferences.',
            eyebrow: 'AI Investor Memo',
            fit_score: 'Fit Score',
            good_fit: 'Good Fit',
            key_risks: 'Key Risks',
            low_fit: 'Low Fit',
            moderate_fit: 'Moderate Fit',
            next_step_data_room:
              'Request or review Data Room access before making any investment decision.',
            next_step_financials:
              'Check audited financial statements, revenue quality, EBITDA adjustments, and customer concentration.',
            next_step_risks:
              'Review legal, operational, and valuation risks with advisors before proceeding.',
            no_major_risks: 'No major mismatch was detected from the available public data.',
            no_reasons: 'No strong matching signal was identified from the current profile.',
            strong_fit: 'Strong Fit',
            suggested_next_steps: 'Suggested Next Steps',
            title: 'Personalized Deal Analysis',
            why_fit: 'Why This Fits',

            ai_commentary: 'AI Generated Commentary',
            ai_commentary_title: 'Investor-Oriented Memo',
            ai_commentary_loading: 'Generating investor commentary...',
            ai_commentary_unavailable:
              'AI commentary is unavailable. Use the rule-based analysis above.',
            ai_highlights: 'Investment Highlights',
            ai_risks: 'Risks To Review',
            ai_questions: 'Due Diligence Questions',
            ai_next_action: 'Suggested Next Action',
},
      },
      "home": {
        "compliance_layer": "Compliance Layer",
        "cta_complete_kyc": "Complete KYC",
        "cta_enter_marketplace": "Enter Marketplace",
        "cta_initialize_access": "Initialize Access",
        "deal_operating_system": "Deal Operating System",
        "hero_badge": "Institutional M&A Ecosystem",
        "hero_description": "A secure workspace for private market deals with KYC-gated access, protected data rooms, role-based workflows, and compliance review.",
        "hero_title_gradient": "Transaction",
        "hero_title_line_1": "Verified",
        "hero_title_line_3": "Intelligence.",
        "lifecycle": {
          "closing_label": "Closing",
          "closing_value": "Final asset settlement",
          "diligence_label": "Diligence",
          "diligence_value": "NDA-gated data vaults",
          "legal_label": "Legal",
          "legal_value": "Digital SPA orchestration",
          "listing_label": "Listing",
          "listing_value": "Strategic asset profiling",
          "matching_label": "Matching",
          "matching_value": "Proprietary fit scoring",
          "negotiation_label": "Negotiation",
          "negotiation_value": "Dynamic offer management"
        },
        "metrics": {
          "compliance_label": "Compliance",
          "compliance_value": "Admin Review",
          "data_rooms_label": "Data Rooms",
          "data_rooms_value": "Encrypted",
          "deal_flow_label": "Deal Flow",
          "deal_flow_value": "Private Access",
          "verified_users_label": "Verified Users",
          "verified_users_value": "KYC Gate"
        },
        "submit_asset": "Submit Asset"
      },
      "kyc": {
        "complete_kyc": "Complete KYC",
        "current_status": "Current status: {{status}}",
        "not_verified_description": "Complete KYC before using private deal features.",
        "not_verified_label": "Not Verified",
        "pending_description": "KYC has been submitted and is waiting for admin review.",
        "pending_label": "In Review",
        "rejected_description": "KYC was rejected. Please resubmit CCCD and face verification.",
        "rejected_label": "Rejected",
        "required_description": "You need verified KYC before using marketplace functions, deal submission, dashboard, data room, and private deal workflows.",
        "required_eyebrow": "KYC Required",
        "status_with_label": "KYC Status: {{label}}",
        "verification_required": "Verification Required",
        "verified_description": "Identity verified. Full workspace access is enabled.",
        "verified_label": "Verified"
      },
      "marketplace": {
        "ai_recommendations": "AI Recommendations",
        "ai_filter_active": "Showing {{count}} AI-matched opportunities",
        "ai_available": "{{count}} top matches ready",
        "badge": "Private Deal Network",
        "description": "Browse verified private-market opportunities with KYC-gated visibility, AI compatibility scores, and secure workflow controls.",
        "ebitda_value": "EBITDA {{value}}",
        "empty": "No opportunities match your filters.",
        "filters": {
          "deal_size": "Deal Size",
          "geography": "Geography",
          "industry": "Industry"
        },
        "fit": {
          "strong": "Strong Fit",
          "good": "Good Fit",
          "moderate": "Moderate Fit",
          "low": "Low Fit"
        },
        "high_affinity": "High Affinity",
        "indicative_value": "Indicative Value",
        "opportunities_found": "{{count}} opportunities found",
        "options": {
          "10m_25m": "$10M - $25M",
          "25m": "$25M+",
          "_10m": "< $10M",
          "all": "All",
          "consumer": "Consumer",
          "financial_services": "Financial Services",
          "healthcare": "Healthcare",
          "indonesia": "Indonesia",
          "logistics": "Logistics",
          "singapore": "Singapore",
          "technology": "Technology",
          "thailand": "Thailand",
          "united_states": "United States",
          "vietnam": "Vietnam",
          "10m": "< $10M"
        },
        "revenue_ttm": "Revenue TTM",
        "search_placeholder": "Search deal, sector, location...",
        "table": {
          "action": "Action",
          "ai_compatibility": "AI Compatibility",
          "asset_name": "Asset Name",
          "core_metrics": "Core Metrics",
          "target_valuation": "Target Valuation"
        },
        "title": "Marketplace",
        "watermarking_enabled": "Watermarking Enabled"
      },
      "navbar": {
        "admin": "Admin",
        "brand": "Nexus",
        "brand_subtitle": "Institutional",
        "dashboard": "Dashboard",
        "data_room": "Data Room",
        "encrypted": "Encrypted",
        "footer_copyright": "© 2026 M&A Nexus // Terminal V4",
        "go_to_kyc": "Go To KYC",
        "kyc_gated": "KYC Gated",
        "kyc_locked_banner": "Your workspace is locked until KYC is verified. Complete CCCD and face verification to unlock protected features.",
        "kyc_required_title": "KYC verification required",
        "lang_en": "EN",
        "lang_vi": "VI",
        "log_out": "Log Out",
        "marketplace": "Marketplace",
        "profile_kyc": "Profile & KYC",
        "rbac_enabled": "RBAC Enabled",
        "sign_in": "Sign In",
        "submit_deal": "Submit Deal",
        "switch_to_english": "Switch to English",
        "switch_to_vietnamese": "Switch to Vietnamese"
      },
      "profile": {
        "account_description": "Keep your operator profile accurate for deal review and compliance routing.",
        "account_information": "Account Information",
        "cccd_face_check": "CCCD + Face Check",
        "cccd_face_required": "Upload both sides of CCCD and capture your face for manual compliance review.",
        "checklist": {
          "capture_face": "Capture face image",
          "upload_back": "Upload CCCD back",
          "upload_front": "Upload CCCD front"
        },
        "country": "Country",
        "description": "Manage role, account data, and identity verification for protected deal workflows.",
        "email": "Email",
        "errors": {
          "camera_access": "Unable to access camera.",
          "face_capture": "Unable to capture face image.",
          "kyc_submission_failed": "KYC submission failed.",
          "profile_update_failed": "Profile update failed.",
          "upload_all_required": "Please upload CCCD front, CCCD back, and capture your face."
        },
        "full_name": "Full Name",
        "identity_workspace": "Identity Workspace",
        "kyc_checklist": "KYC Checklist",
        "kyc_form": {
          "back": "Back",
          "business": "Business",
          "cancel_camera": "Cancel Camera",
          "capture_face": "Capture Face",
          "captured": "Captured",
          "cccd_back": "CCCD Back",
          "cccd_back_desc": "Upload the back side of your CCCD.",
          "cccd_front": "CCCD Front",
          "cccd_front_desc": "Upload the front side of your CCCD.",
          "face": "Face",
          "face_capture_alt": "Face capture preview",
          "face_desc": "Use your camera to capture a clear face image.",
          "face_verification": "Face Verification",
          "front": "Front",
          "individual": "Individual",
          "open_camera": "Open Camera",
          "retake_face": "Retake Face",
          "type": "Verification Type"
        },
        "kyc_status": {
          "in_review": "In Review",
          "in_review_description": "Your KYC submission is waiting for admin review.",
          "not_verified": "Not Verified",
          "not_verified_description": "Complete identity verification to unlock protected workflows.",
          "rejected": "Rejected",
          "rejected_description": "Your KYC was rejected. Please resubmit clear documents.",
          "verified": "Verified",
          "verified_description": "Your identity has been verified. Protected workflows are available."
        },
        "kyc_status_label": "KYC Status: {{status}}",
        "messages": {
          "firestore_local_save": "Profile was saved locally because Firestore update was blocked.",
          "kyc_submitted": "KYC submitted for review.",
          "profile_saved": "Profile saved.",
          "publish_rules": "Firestore rules may need publishing before this action works in production."
        },
        "minimum_requirements": "Minimum Requirements",
        "no_email": "No email",
        "no_name": "No name",
        "platform_roles": "Platform Roles",
        "platform_roles_description": "Your role controls permissions, marketplace actions, and workflow access.",
        "primary_role": "Primary Role",
        "progress": {
          "preparing_back": "Preparing CCCD back...",
          "preparing_face": "Preparing face image...",
          "preparing_front": "Preparing CCCD front...",
          "saving_profile": "Saving profile..."
        },
        "resubmit_kyc": "Resubmit KYC",
        "role_change_note": "Role changes may affect what you can access and submit.",
        "role_descriptions": {
          "admin": "Review KYC, moderate assets, and manage compliance.",
          "advisor": "Support sellers, buyers, and transaction workflows.",
          "buyer": "Access marketplace opportunities and request NDA access.",
          "seller": "Submit assets and manage private deal workflows."
        },
        "save_profile": "Save Profile",
        "security": {
          "cccd_review_text": "Both sides are checked for readable identity information.",
          "cccd_review_title": "CCCD Review",
          "face_capture_text": "Face image helps manual identity comparison.",
          "face_capture_title": "Face Capture",
          "manual_review_text": "Compliance admins approve or reject submissions.",
          "manual_review_title": "Manual Review"
        },
        "start_verification": "Start Verification",
        "submit_kyc": "Submit KYC",
        "title": "Profile & Verification",
        "unnamed_user": "Unnamed User",
        "user_avatar": "User avatar",
        "verification": "Verification",
        "verification_notes": "Verification Notes",
        "verification_notes_description": "Admin review may take time after submission. Make sure documents are clear and readable."
      },
      "roles": {
        "admin": "Admin",
        "advisor": "Advisor",
        "buyer": "Buyer",
        "seller": "Seller"
      },
      "statuses": {
        "deals": {
          "draft": "Draft",
          "under_review": "Under Review",
          "approved": "Approved",
          "published": "Published",
          "closed": "Closed",
          "rejected": "Rejected"
        },
        "nda": {
          "requested": "Requested",
          "signed": "Signed",
          "rejected": "Rejected",
          "pending": "Pending"
        }
      },
      "debug": {
        "nda_debug": "NDA Debug",
        "summary": "Summary",
        "all_ndas": "All NDAs",
        "profile": "Profile",
        "my_ndas": "My NDAs",
        "deals": "Deals",
        "create_test": "Create Test",
        "logs": "Logs",
        "clear": "Clear",
        "empty": "Click a button to debug..."
      }
    }
  },
  "vi": {
    "translation": {
      "admin": {
        "access_denied": "Từ chối truy cập",
        "access_denied_description": "Chỉ quản trị viên tuân thủ mới có thể truy cập bảng này.",
        "approve": "Phê duyệt",
        "approve_kyc": "Phê duyệt KYC",
        "command_center": "Trung tâm điều phối",
        "description": "Rà soát hồ sơ KYC, kiểm tra tài liệu và phê duyệt quyền truy cập đã xác minh.",
        "document_preview": "Xem trước tài liệu",
        "file_number": "Tệp {{index}}",
        "full_size_kyc_document": "Tài liệu KYC kích thước đầy đủ",
        "kyc_document_alt": "Tài liệu KYC",
        "kyc_submitted_file": "Tệp KYC đã gửi",
        "live_queue": "Hàng đợi trực tiếp",
        "member": "Thành viên",
        "mock_verified": "Xác minh mẫu",
        "no_documents": "Không có tài liệu",
        "no_email": "Không có email",
        "no_match_description": "Thử điều chỉnh từ khóa tìm kiếm.",
        "no_matching_records": "Không có bản ghi phù hợp",
        "pending": "Đang chờ",
        "pending_count": "{{count}} đang chờ",
        "pending_kyc_reviews": "KYC chờ rà soát",
        "queue_clear": "Hàng đợi trống",
        "queue_clear_description": "Không có hồ sơ KYC đang chờ rà soát.",
        "refresh": "Làm mới",
        "reject": "Từ chối",
        "reject_kyc": "Từ chối KYC",
        "restricted_area": "Khu vực hạn chế",
        "review_error": "Thao tác rà soát thất bại.",
        "role_country": "{{role}} / {{country}}",
        "search_placeholder": "Tìm người dùng, email, vai trò...",
        "stats": {
          "files_attached": "Tệp đính kèm",
          "pending_reviews": "Hồ sơ chờ rà soát",
          "profiles_with_documents": "Hồ sơ có tài liệu",
          "ready_to_inspect": "Sẵn sàng kiểm tra",
          "submitted_documents": "Tài liệu đã gửi",
          "users_waiting": "Người dùng đang chờ"
        },
        "table": {
          "actions": "Thao tác",
          "documents": "Tài liệu",
          "email": "Email",
          "role": "Vai trò",
          "user": "Người dùng"
        },
        "title": "Bảng quản trị",
        "unnamed_user": "Người dùng chưa đặt tên",
        "view_document_image": "Xem ảnh tài liệu"
      },
      "auth": {
        "access_key": "Mật khẩu truy cập",
        "authorized_user": "Đã xác thực",
        "back_to_home": "Về trang chủ",
        "back_to_register": "Quay lại đăng ký",
        "confirm_account": "Xác nhận tài khoản",
        "corporate_email": "Email doanh nghiệp",
        "enter_workspace": "Vào không gian làm việc",
        "errors": {
          "email_already_in_use": "Email đã tồn tại.",
          "firestore_connection": "Lỗi kết nối Firestore.",
          "invalid_credentials": "Thông tin đăng nhập sai.",
          "invalid_email": "Email không hợp lệ.",
          "invalid_otp": "Mã xác nhận không chính xác.",
          "otp_send_failed": "Không thể gửi mã xác nhận về email.",
          "system_error": "Lỗi hệ thống.",
          "unauthorized_domain": "Domain chưa được cấp phép trong Firebase.",
          "weak_password": "Mật khẩu tối thiểu 6 ký tự."
        },
        "full_name": "Họ và tên",
        "google_sso": "Google SSO",
        "or_continue_with": "Hoặc tiếp tục với",
        "otp_description": "Nhập mã xác minh đã gửi đến {{email}}.",
        "otp_placeholder": "000000",
        "page_not_exist": "Trang này không tồn tại",
        "processing": "Đang xử lý...",
        "register_switch": "Người dùng mới? Đăng ký",
        "route_not_found": "Không tìm thấy tuyến",
        "route_unavailable": "Tuyến bạn yêu cầu không có trong không gian làm việc này.",
        "secure_access_only": "Chỉ truy cập bảo mật",
        "secure_description": "Quyền truy cập được bảo vệ cho nhà đầu tư, bên bán, cố vấn và quản trị tuân thủ đã xác minh.",
        "send_verification": "Gửi mã xác minh",
        "sign_in": "Đăng nhập",
        "sign_in_before_accessing": "Vui lòng đăng nhập trước khi truy cập không gian làm việc được bảo vệ này.",
        "sign_in_required": "Yêu cầu đăng nhập",
        "sign_in_switch": "Đã được cấp quyền? Đăng nhập",
        "terminal": "Cổng bảo mật NexusM&A",
        "title_login": "Truy cập bảo mật",
        "title_otp": "Xác minh email",
        "title_register": "Tạo tài khoản",
        "verification_code": "Mã xác minh",
        "otp_email_message": "Mã này sẽ hết hạn sau vài phút. Vui lòng không chia sẻ mã cho bất kỳ ai."
      },
      "common": {
        "back": "Quay lại",
        "cancel": "Hủy",
        "confidential": "Bảo mật",
        "done": "Hoàn tất",
        "loading_initializing_nexus": "Đang khởi tạo Nexus",
        "not_applicable": "Không áp dụng",
        "not_set": "Chưa thiết lập",
        "private": "Riêng tư",
        "required": "Bắt buộc",
        "saving": "Đang lưu...",
        "select_label": "Chọn {{label}}",
        "submitting": "Đang gửi...",
        "tba": "Chưa công bố",
        "unknown_error": "Lỗi không xác định"
      },
      "create_deal": {
        "alerts": {
          "kyc_seller_required": "Cần xác minh KYC và vai trò bên bán/cố vấn trước khi gửi thương vụ.",
          "sign_in_required": "Vui lòng đăng nhập trước khi gửi thương vụ.",
          "submission_failed": "Gửi thương vụ thất bại."
        },
        "badge": "Quy trình gửi của bên bán",
        "completion": "Mức hoàn tất",
        "completion_note": "Hoàn tất các trường bắt buộc trước khi gửi tài sản để rà soát.",
        "compliance_note": "Lưu ý tuân thủ",
        "compliance_text": "Mọi thông tin gửi lên sẽ được rà soát bởi quản trị viên, ghi log kiểm toán và công bố có kiểm soát.",
        "deal_builder": "Bộ tạo thương vụ",
        "deal_types": {
          "fundraising": "Gọi vốn",
          "sell_100": "Bán 100%",
          "sell_equity": "Bán cổ phần"
        },
        "description": "Tạo bộ hồ sơ niêm yết có cấu trúc để quản trị viên rà soát, người mua đã xác minh tiếp cận và phòng dữ liệu được mở có kiểm soát.",
        "document_demo_note": "Bản demo này chỉ đánh dấu tài liệu đã chọn. Ở production, hãy nối bước này với upload bảo mật và lập chỉ mục phòng dữ liệu.",
        "document_prepared": "Đánh dấu tài liệu này đã sẵn sàng cho bộ thẩm định.",
        "documents": {
          "business_license": "Giấy phép kinh doanh",
          "financial_report": "Báo cáo tài chính",
          "legal_documents": "Tài liệu pháp lý",
          "pitch_deck": "Pitch deck",
          "shareholder_list": "Danh sách cổ đông"
        },
        "fields": {
          "country_registration": "Quốc gia đăng ký",
          "deal_summary": "Tóm tắt thương vụ",
          "deal_title": "Tên thương vụ",
          "deal_type": "Loại thương vụ",
          "equity_offered": "Tỷ lệ chào bán",
          "esop_ownership": "Tỷ lệ ESOP",
          "founded_year": "Năm thành lập",
          "founder_ownership": "Tỷ lệ sở hữu nhà sáng lập",
          "future_plan": "Kế hoạch tương lai",
          "growth_rate": "Tốc độ tăng trưởng",
          "industry": "Ngành",
          "investor_ownership": "Tỷ lệ sở hữu nhà đầu tư",
          "legal_entity_name": "Tên pháp nhân",
          "location": "Địa điểm",
          "net_profit": "Lợi nhuận ròng",
          "products_services": "Sản phẩm & dịch vụ",
          "reason": "Lý do chiến lược",
          "revenue": "Doanh thu",
          "target_markets": "Thị trường mục tiêu",
          "tax_id": "Mã số thuế",
          "valuation": "Định giá"
        },
        "industries": {
          "consumer": "Tiêu dùng",
          "education": "Giáo dục",
          "financial_services": "Dịch vụ tài chính",
          "healthcare": "Y tế",
          "logistics": "Logistics",
          "manufacturing": "Sản xuất",
          "technology": "Công nghệ"
        },
        "last_three_years": "3 năm gần nhất",
        "locked_description": "Chỉ bên bán và cố vấn đã xác minh mới có thể gửi tài sản lên thị trường riêng tư.",
        "locked_title": "Cần KYC bên bán",
        "next_step": "Bước tiếp theo",
        "progress": "Tiến độ",
        "snapshot": {
          "company": "Công ty",
          "deal_preview": "Xem trước thương vụ",
          "docs": "Tài liệu",
          "docs_selected": "Đã chọn {{selected}}/{{total}}",
          "industry": "Ngành",
          "live_snapshot": "Ảnh chụp hiện tại",
          "valuation": "Định giá"
        },
        "step_number": "Bước {{step}}",
        "step_of_total": "Bước {{step}}/{{total}}",
        "steps": {
          "deal_terms": {
            "description": "Loại giao dịch, định giá, tỷ lệ cổ phần và lý do chiến lược.",
            "short_title": "Điều khoản",
            "title": "Điều khoản thương vụ"
          },
          "documents": {
            "description": "Bộ tài liệu thẩm định cần cho quy trình kiểm duyệt.",
            "short_title": "Hồ sơ",
            "title": "Tài liệu"
          },
          "financials": {
            "description": "Doanh thu, EBITDA, lợi nhuận và chỉ số tăng trưởng.",
            "short_title": "Tài chính",
            "title": "Tài chính"
          },
          "legal_entity": {
            "description": "Thông tin đăng ký công ty, sở hữu và danh tính pháp lý.",
            "short_title": "Pháp lý",
            "title": "Pháp nhân"
          },
          "operations": {
            "description": "Tên thương vụ, ngành, địa điểm, sản phẩm và thị trường mục tiêu.",
            "short_title": "Thị trường",
            "title": "Vận hành"
          }
        },
        "submit_for_review": "Gửi để rà soát",
        "title": "Gửi thương vụ mới",
        "year_number": "Năm {{year}}"
      },
      "dashboard": {
        "action_items": "Việc cần làm",
        "actions": {
          "awaiting_approval": "Chờ phê duyệt",
          "kyc_review": "Rà soát KYC",
          "legal_milestone": "Mốc pháp lý",
          "nda_request": "Yêu cầu NDA",
          "negotiation": "Đàm phán",
          "new_message": "Tin nhắn mới",
          "profiles_pending": "Hồ sơ đang chờ",
          "spa_draft_ready": "Bản nháp SPA sẵn sàng"
        },
        "admin": {
          "all_identities_cleared": "Tất cả danh tính đã được xử lý.",
          "anonymous": "Ẩn danh",
          "asset_moderation": "Kiểm duyệt tài sản",
          "asset_pipeline_empty": "Hàng đợi kiểm duyệt tài sản đang trống.",
          "description": "Trung tâm quản trị để rà soát danh tính và kiểm duyệt tài sản.",
          "identity_verification": "Xác minh danh tính",
          "lvl4_auth": "Xác thực cấp 4",
          "pending_count": "{{count}} đang chờ",
          "priority_review": "Rà soát ưu tiên",
          "protocol": "Giao thức",
          "reject": "Từ chối",
          "review_asset": "Rà soát tài sản",
          "verify": "Xác minh"
        },
        "audit": "Kiểm toán",
        "default_name": "Người vận hành",
        "errors": {
          "deal_moderation_failed": "Kiểm duyệt thương vụ thất bại.",
          "firestore_rules_blocking_nda": "Quy tắc Firestore đang chặn cập nhật NDA này.",
          "kyc_moderation_failed": "Kiểm duyệt KYC thất bại.",
          "nda_update_failed": "Cập nhật NDA thất bại."
        },
        "explorer_marketplace": "Khám phá thị trường",
        "footer": {
          "audit_desc": "Mọi hành động được ghi lại để phục vụ kiểm tra tuân thủ.",
          "compliance_desc": "KYC, NDA và luồng phê duyệt luôn được kiểm soát.",
          "encrypted_desc": "Quy trình bảo vệ cho giao dịch thị trường tư nhân.",
          "encrypted_infrastructure": "Hạ tầng mã hóa",
          "global_compliance": "Tuân thủ toàn cầu",
          "realtime_audit": "Kiểm toán thời gian thực"
        },
        "high_priority": "Ưu tiên cao",
        "live_operations": "Vận hành trực tiếp",
        "messages": {
          "deal_moved": "Thương vụ đã chuyển sang {{status}}.",
          "kyc_status_for_user": "KYC được đánh dấu {{status}} cho {{user}}.",
          "nda_approved": "NDA đã được phê duyệt và ký.",
          "nda_rejected": "Yêu cầu NDA đã bị từ chối."
        },
        "nda": {
          "asset_id": "Mã tài sản",
          "awaiting_counter_signature": "Đang chờ bên bán ký đối ứng.",
          "deny": "Từ chối",
          "execute_sign": "Ký xác nhận",
          "mutual_request": "Yêu cầu NDA song phương",
          "no_active_requests": "Không có yêu cầu NDA đang hoạt động.",
          "title": "Hàng đợi kiểm soát NDA",
          "watermarked_access_granted": "Đã cấp quyền vào phòng dữ liệu có watermark."
        },
        "new_asset_listing": "Niêm yết tài sản mới",
        "portfolio_health": "Sức khỏe danh mục",
        "stats": {
          "active_listings": "Niêm yết đang hoạt động",
          "pending_actions": "Tác vụ chờ xử lý",
          "pipeline_value": "Giá trị pipeline",
          "signed_ndas": "NDA đã ký"
        },
        "title": "Bảng điều khiển",
        "valuation": "Định giá",
        "welcome_prefix": "Chào mừng trở lại,",
        "welcome_suffix": "Không gian đã xác minh của bạn được đồng bộ với luồng thương vụ, yêu cầu NDA và tác vụ tuân thủ."
      },
      "data_room": {
        "avg_session": "Phiên TB",
        "back_to_listing": "Quay lại niêm yết",
        "bulk_upload": "Tải lên hàng loạt",
        "complete_verification": "Hoàn tất xác minh",
        "directory_stack": "Cấu trúc thư mục",
        "download_secure_file": "Tải tài liệu bảo mật",
        "folders": {
          "contracts": "Hợp đồng",
          "financial": "Tài chính",
          "hr": "Nhân sự",
          "legal": "Pháp lý",
          "technology": "Công nghệ"
        },
        "identity": "danh tính",
        "locked_description_middle": "và đã ký",
        "locked_description_prefix": "Cần xác minh",
        "locked_description_suffix": "trước khi truy cập kho dữ liệu này.",
        "locked_title": "Phòng dữ liệu bị khóa",
        "permissions": {
          "download": "Tải xuống",
          "edit": "Chỉnh sửa",
          "view_only": "Chỉ xem"
        },
        "policy": {
          "audit_text": "Lượt xem và tải xuống được ghi lại cùng danh tính người dùng và ngữ cảnh thương vụ.",
          "audit_trail": "Dấu vết kiểm toán",
          "export_policy": "Chính sách xuất file",
          "export_text": "Tệp nhạy cảm vẫn được watermark và giới hạn theo quyền.",
          "security": "Bảo mật",
          "security_text": "Quyền theo vai trò, cổng KYC và trạng thái NDA bảo vệ từng tài liệu."
        },
        "restricted_protocol": "Giao thức hạn chế",
        "return_to_market": "Quay lại thị trường",
        "search_placeholder": "Tìm tài liệu...",
        "secure_repository": "Kho dữ liệu bảo mật",
        "stats": {
          "audit_trail": "Dấu vết kiểm toán",
          "downloads": "{{count}} lượt tải",
          "engagement": "Tương tác",
          "exfiltration": "Xuất dữ liệu",
          "protection": "Bảo vệ",
          "views": "{{count}} lượt xem",
          "watermarked": "Đã watermark"
        },
        "title": "Phòng dữ liệu",
        "unknown_asset": "Tài sản không xác định",
        "vault_protected": "Kho được bảo vệ",
        "view_document": "Xem tài liệu",
        "watermark_prefix": "Mọi lượt xem được watermark theo",
        "watermark_suffix": "Các lượt xuất vẫn được ghi log kiểm toán."
      },
      "deal_detail": {
        "access_actions": "Thao tác truy cập",
        "access_granted": "Đã cấp quyền",
        "access_requirement": "Yêu cầu truy cập",
        "actions": {
          "bookmark": "Lưu lại",
          "contact": "Liên hệ",
          "meeting": "Đặt lịch họp",
          "offer": "Gửi đề nghị"
        },
        "ai_deal_intelligence": "Trí tuệ thương vụ AI",
        "ai_fallback": "Không có tóm tắt AI. Hiển thị thông tin thương vụ công khai có cấu trúc.",
        "alerts": {
          "cannot_request_nda": "Tài khoản của bạn chưa đủ điều kiện yêu cầu truy cập NDA.",
          "deal_info_missing": "Thiếu thông tin thương vụ.",
          "enter_legal_name": "Vui lòng nhập tên pháp lý.",
          "no_sample_nda": "Yêu cầu NDA cho thương vụ mẫu đã bị tắt.",
          "real_deals_only": "Yêu cầu NDA chỉ khả dụng cho thương vụ thật.",
          "seller_invalid": "Thông tin bên bán không hợp lệ.",
          "seller_missing": "Thiếu thông tin bên bán.",
          "sign_in_to_request_nda": "Vui lòng đăng nhập trước khi yêu cầu truy cập NDA.",
          "sign_nda_failed": "Ký yêu cầu NDA thất bại."
        },
        "back_to_marketplace": "Quay lại thị trường",
        "deal_control": "Kiểm soát thương vụ",
        "default_summary": "Cơ hội này có dữ liệu công khai đã xác minh và công bố riêng tư có kiểm soát qua quy trình NDA.",
        "generating_summary": "Đang tạo tóm tắt...",
        "kyc_required_first": "Cần KYC trước",
        "kyc_required_for_nda": "Cần KYC trước khi yêu cầu truy cập NDA.",
        "manage_nda_requests": "Quản lý yêu cầu NDA",
        "metrics": {
          "ebitda": "EBITDA",
          "equity_offered": "Tỷ lệ chào bán",
          "revenue": "Doanh thu",
          "valuation": "Định giá"
        },
        "nda_modal": {
          "agree_sign": "Đồng ý & ký",
          "audit_notice": "Việc ký sẽ tạo log kiểm toán và gửi yêu cầu đến bên bán.",
          "clause_confidential_text": "Bên nhận đồng ý bảo vệ mọi thông tin kinh doanh, tài chính, pháp lý và kỹ thuật chưa công khai.",
          "clause_confidential_title": "Thông tin bảo mật",
          "clause_exclusions_text": "Thông tin đã công khai hoặc được phát triển độc lập không thuộc nghĩa vụ bảo mật.",
          "clause_exclusions_title": "Ngoại lệ",
          "clause_number": "Điều khoản {{number}}",
          "clause_obligations_text": "Bên nhận chỉ được sử dụng thông tin đã công bố để đánh giá giao dịch đề xuất.",
          "clause_obligations_title": "Nghĩa vụ bên nhận",
          "digital_signature_required": "Yêu cầu chữ ký số",
          "intro": "Rà soát các điều khoản bên dưới và nhập tên pháp lý của bạn để ký yêu cầu NDA.",
          "name_placeholder": "Tên pháp lý của bạn",
          "signing_securely": "Đang ký bảo mật...",
          "title": "Thỏa thuận NDA song phương",
          "type_legal_name": "Nhập tên pháp lý"
        },
        "nda_pending": "NDA đang chờ",
        "nda_request_pending": "Yêu cầu NDA đang chờ",
        "nda_required": "Cần NDA",
        "not_found": {
          "description": "Thương vụ được yêu cầu không khả dụng hoặc đã bị xóa.",
          "eyebrow": "Không tìm thấy thương vụ",
          "title": "Thương vụ này không tồn tại"
        },
        "open_data_room": "Mở phòng dữ liệu",
        "private_content_available": "Nội dung riêng tư sẵn sàng",
        "private_view": {
          "contracts": "Hợp đồng",
          "corporate_records": "Hồ sơ doanh nghiệp",
          "eyebrow": "Truy cập riêng tư",
          "full_financial_model": "Mô hình tài chính đầy đủ",
          "ip_documents": "Tài liệu sở hữu trí tuệ",
          "title": "Tài liệu thẩm định đã mở khóa"
        },
        "public_view": {
          "eyebrow": "Xem trước công khai",
          "market_position": "Vị thế thị trường",
          "market_position_default": "Định vị cho tăng trưởng chiến lược trong phân khúc mục tiêu.",
          "next_step": "Bước tiếp theo",
          "next_step_text": "Hoàn tất KYC và ký NDA để truy cập tài liệu bảo mật.",
          "strategic_objective": "Mục tiêu chiến lược",
          "strategic_objective_default": "Tiếp cận nhà đầu tư đủ điều kiện qua công bố có kiểm soát.",
          "title": "Ảnh chụp thương vụ công khai"
        },
        "review_sign_nda": "Xem & ký NDA",
        "sample_deal": "Thương vụ mẫu",
        "scores": {
          "buyer_fit": "Phù hợp bên mua",
          "growth": "Tăng trưởng",
          "lower_better": "Thấp hơn là tốt hơn",
          "match": "Phù hợp",
          "revenue_momentum": "Đà doanh thu",
          "risk": "Rủi ro"
        },
        "security_status": "Trạng thái bảo mật",
        "seller": {
          "kyc_license_records": "Hồ sơ KYC và giấy phép được gắn với tài khoản.",
          "listing_managed_by": "Niêm yết được quản lý bởi",
          "verified_seller_advisor": "Bên bán hoặc cố vấn đã xác minh"
        },
        "sign_nda_to_request": "Ký NDA để yêu cầu truy cập",
        "strategic_summary": "Tóm tắt chiến lược",
        "workflow": {
          "closing_archive": "Lưu trữ hoàn tất",
          "esignature": "Chữ ký điện tử",
          "generate_nda": "Tạo NDA",
          "negotiate_spa": "Đàm phán SPA",
          "review_loi": "Rà soát LOI",
          "title": "Quy trình pháp lý"
        },
        investor_memo: {
          description:
            'Bản ghi nhớ này so sánh thương vụ với khẩu vị đầu tư, quy mô vốn mục tiêu, mức chịu rủi ro và ưu tiên chiến lược của bạn.',
          eyebrow: 'AI Investor Memo',
          fit_score: 'Điểm phù hợp',
          good_fit: 'Phù hợp cao',
          key_risks: 'Rủi ro cần lưu ý',
          low_fit: 'Phù hợp thấp',
          moderate_fit: 'Phù hợp trung bình',
          next_step_data_room:
            'Yêu cầu hoặc kiểm tra quyền truy cập Data Room trước khi ra quyết định đầu tư.',
          next_step_financials:
            'Kiểm tra báo cáo tài chính đã kiểm toán, chất lượng doanh thu, điều chỉnh EBITDA và mức độ tập trung khách hàng.',
          next_step_risks:
            'Rà soát rủi ro pháp lý, vận hành và định giá cùng cố vấn trước khi tiếp tục.',
          no_major_risks: 'Chưa phát hiện điểm lệch lớn từ dữ liệu công khai hiện có.',
          no_reasons: 'Chưa phát hiện tín hiệu phù hợp mạnh từ hồ sơ hiện tại.',
          strong_fit: 'Rất phù hợp',
          suggested_next_steps: 'Bước tiếp theo nên làm',
          title: 'Phân tích cá nhân hóa cho nhà đầu tư',
          why_fit: 'Vì sao phù hợp',

          ai_commentary: 'Nhận xét AI',
          ai_commentary_title: 'Bản ghi nhớ dành cho nhà đầu tư',
          ai_commentary_loading: 'Đang tạo nhận xét cho nhà đầu tư...',
          ai_commentary_unavailable:
            'Chưa có nhận xét AI. Hãy dùng phần phân tích theo quy tắc phía trên.',
          ai_highlights: 'Điểm hấp dẫn đầu tư',
          ai_risks: 'Rủi ro cần rà soát',
          ai_questions: 'Câu hỏi thẩm định',
          ai_next_action: 'Hành động tiếp theo đề xuất',
},
      },
      "home": {
        "compliance_layer": "Lớp tuân thủ",
        "cta_complete_kyc": "Hoàn tất KYC",
        "cta_enter_marketplace": "Vào thị trường",
        "cta_initialize_access": "Khởi tạo truy cập",
        "deal_operating_system": "Hệ điều hành thương vụ",
        "hero_badge": "Hệ sinh thái M&A dành cho tổ chức",
        "hero_description": "Không gian làm việc bảo mật cho các thương vụ thị trường tư nhân với truy cập qua KYC, phòng dữ liệu được bảo vệ, quy trình theo vai trò và rà soát tuân thủ.",
        "hero_title_gradient": "Giao dịch",
        "hero_title_line_1": "Xác minh",
        "hero_title_line_3": "Thông minh.",
        "lifecycle": {
          "closing_label": "Hoàn tất",
          "closing_value": "Tất toán tài sản cuối cùng",
          "diligence_label": "Thẩm định",
          "diligence_value": "Kho dữ liệu có kiểm soát NDA",
          "legal_label": "Pháp lý",
          "legal_value": "Điều phối SPA số",
          "listing_label": "Niêm yết",
          "listing_value": "Lập hồ sơ tài sản chiến lược",
          "matching_label": "Ghép nối",
          "matching_value": "Chấm điểm mức độ phù hợp độc quyền",
          "negotiation_label": "Đàm phán",
          "negotiation_value": "Quản lý đề nghị linh hoạt"
        },
        "metrics": {
          "compliance_label": "Tuân thủ",
          "compliance_value": "Quản trị rà soát",
          "data_rooms_label": "Phòng dữ liệu",
          "data_rooms_value": "Đã mã hóa",
          "deal_flow_label": "Luồng thương vụ",
          "deal_flow_value": "Truy cập riêng tư",
          "verified_users_label": "Người dùng đã xác minh",
          "verified_users_value": "Cổng KYC"
        },
        "submit_asset": "Gửi tài sản"
      },
      "kyc": {
        "complete_kyc": "Hoàn tất KYC",
        "current_status": "Trạng thái hiện tại: {{status}}",
        "not_verified_description": "Hoàn tất KYC trước khi sử dụng các tính năng thương vụ riêng tư.",
        "not_verified_label": "Chưa xác minh",
        "pending_description": "KYC đã được gửi và đang chờ quản trị viên xét duyệt.",
        "pending_label": "Đang xét duyệt",
        "rejected_description": "KYC bị từ chối. Vui lòng gửi lại CCCD và xác minh khuôn mặt.",
        "rejected_label": "Bị từ chối",
        "required_description": "Bạn cần KYC đã được xác minh trước khi sử dụng chức năng thị trường, gửi thương vụ, bảng điều khiển, phòng dữ liệu và quy trình thương vụ riêng tư.",
        "required_eyebrow": "Yêu cầu KYC",
        "status_with_label": "Trạng thái KYC: {{label}}",
        "verification_required": "Cần xác minh",
        "verified_description": "Danh tính đã được xác minh. Toàn bộ quyền truy cập không gian làm việc đã được bật.",
        "verified_label": "Đã xác minh"
      },
      "marketplace": {
        "ai_recommendations": "Gợi ý AI",
        "ai_filter_active": "Đang hiển thị {{count}} cơ hội phù hợp với AI",
        "ai_available": "{{count}} gợi ý phù hợp nhất",
        "badge": "Mạng lưới thương vụ riêng tư",
        "description": "Duyệt các cơ hội thị trường tư nhân đã xác minh với khả năng hiển thị qua KYC, điểm tương thích AI và kiểm soát quy trình bảo mật.",
        "ebitda_value": "EBITDA {{value}}",
        "empty": "Không có cơ hội phù hợp với bộ lọc.",
        "filters": {
          "deal_size": "Quy mô thương vụ",
          "geography": "Khu vực",
          "industry": "Ngành"
        },
        "fit": {
          "strong": "Rất phù hợp",
          "good": "Phù hợp cao",
          "moderate": "Phù hợp trung bình",
          "low": "Phù hợp thấp"
        },
        "high_affinity": "Phù hợp cao",
        "indicative_value": "Giá trị tham chiếu",
        "opportunities_found": "Tìm thấy {{count}} cơ hội",
        "options": {
          "10m_25m": "10 triệu - 25 triệu USD",
          "25m": "Trên 25 triệu USD",
          "_10m": "< 10 triệu USD",
          "all": "Tất cả",
          "consumer": "Tiêu dùng",
          "financial_services": "Dịch vụ tài chính",
          "healthcare": "Y tế",
          "indonesia": "Indonesia",
          "logistics": "Logistics",
          "singapore": "Singapore",
          "technology": "Công nghệ",
          "thailand": "Thái Lan",
          "united_states": "Hoa Kỳ",
          "vietnam": "Việt Nam",
          "10m": "< 10 triệu USD"
        },
        "revenue_ttm": "Doanh thu TTM",
        "search_placeholder": "Tìm thương vụ, ngành, địa điểm...",
        "table": {
          "action": "Thao tác",
          "ai_compatibility": "Tương thích AI",
          "asset_name": "Tên tài sản",
          "core_metrics": "Chỉ số chính",
          "target_valuation": "Định giá mục tiêu"
        },
        "title": "Thị trường",
        "watermarking_enabled": "Đã bật watermark"
      },
      "navbar": {
        "admin": "Quản trị",
        "brand": "Nexus",
        "brand_subtitle": "Tổ chức",
        "dashboard": "Bảng điều khiển",
        "data_room": "Phòng dữ liệu",
        "encrypted": "Đã mã hóa",
        "footer_copyright": "© 2026 M&A Nexus // Terminal V4",
        "go_to_kyc": "Đến KYC",
        "kyc_gated": "Yêu cầu KYC",
        "kyc_locked_banner": "Không gian làm việc của bạn bị khóa cho đến khi KYC được xác minh. Hoàn tất xác thực CCCD và khuôn mặt để mở khóa các tính năng được bảo vệ.",
        "kyc_required_title": "Cần xác minh KYC",
        "lang_en": "EN",
        "lang_vi": "VI",
        "log_out": "Đăng xuất",
        "marketplace": "Thị trường",
        "profile_kyc": "Hồ sơ & KYC",
        "rbac_enabled": "Đã bật RBAC",
        "sign_in": "Đăng nhập",
        "submit_deal": "Gửi thương vụ",
        "switch_to_english": "Chuyển sang tiếng Anh",
        "switch_to_vietnamese": "Chuyển sang tiếng Việt"
      },
      "profile": {
        "account_description": "Giữ hồ sơ người vận hành chính xác để phục vụ rà soát thương vụ và điều hướng tuân thủ.",
        "account_information": "Thông tin tài khoản",
        "cccd_face_check": "Kiểm tra CCCD + khuôn mặt",
        "cccd_face_required": "Tải hai mặt CCCD và chụp khuôn mặt để quản trị viên tuân thủ rà soát thủ công.",
        "checklist": {
          "capture_face": "Chụp ảnh khuôn mặt",
          "upload_back": "Tải mặt sau CCCD",
          "upload_front": "Tải mặt trước CCCD"
        },
        "country": "Quốc gia",
        "description": "Quản lý vai trò, dữ liệu tài khoản và xác minh danh tính cho quy trình thương vụ được bảo vệ.",
        "email": "Email",
        "errors": {
          "camera_access": "Không thể truy cập camera.",
          "face_capture": "Không thể chụp ảnh khuôn mặt.",
          "kyc_submission_failed": "Gửi KYC thất bại.",
          "profile_update_failed": "Cập nhật hồ sơ thất bại.",
          "upload_all_required": "Vui lòng tải mặt trước CCCD, mặt sau CCCD và chụp khuôn mặt."
        },
        "full_name": "Họ và tên",
        "identity_workspace": "Không gian danh tính",
        "kyc_checklist": "Danh sách KYC",
        "kyc_form": {
          "back": "Mặt sau",
          "business": "Doanh nghiệp",
          "cancel_camera": "Hủy camera",
          "capture_face": "Chụp khuôn mặt",
          "captured": "Đã chụp",
          "cccd_back": "Mặt sau CCCD",
          "cccd_back_desc": "Tải mặt sau CCCD của bạn.",
          "cccd_front": "Mặt trước CCCD",
          "cccd_front_desc": "Tải mặt trước CCCD của bạn.",
          "face": "Khuôn mặt",
          "face_capture_alt": "Ảnh chụp khuôn mặt",
          "face_desc": "Dùng camera để chụp ảnh khuôn mặt rõ ràng.",
          "face_verification": "Xác minh khuôn mặt",
          "front": "Mặt trước",
          "individual": "Cá nhân",
          "open_camera": "Mở camera",
          "retake_face": "Chụp lại",
          "type": "Loại xác minh"
        },
        "kyc_status": {
          "in_review": "Đang xét duyệt",
          "in_review_description": "Hồ sơ KYC của bạn đang chờ quản trị viên rà soát.",
          "not_verified": "Chưa xác minh",
          "not_verified_description": "Hoàn tất xác minh danh tính để mở khóa các quy trình được bảo vệ.",
          "rejected": "Bị từ chối",
          "rejected_description": "KYC của bạn bị từ chối. Vui lòng gửi lại tài liệu rõ hơn.",
          "verified": "Đã xác minh",
          "verified_description": "Danh tính của bạn đã được xác minh. Các quy trình được bảo vệ đã khả dụng."
        },
        "kyc_status_label": "Trạng thái KYC: {{status}}",
        "messages": {
          "firestore_local_save": "Hồ sơ đã được lưu cục bộ vì cập nhật Firestore bị chặn.",
          "kyc_submitted": "KYC đã được gửi để rà soát.",
          "profile_saved": "Đã lưu hồ sơ.",
          "publish_rules": "Có thể cần publish quy tắc Firestore trước khi thao tác này hoạt động ở production."
        },
        "minimum_requirements": "Yêu cầu tối thiểu",
        "no_email": "Không có email",
        "no_name": "Chưa có tên",
        "platform_roles": "Vai trò nền tảng",
        "platform_roles_description": "Vai trò quyết định quyền hạn, thao tác thị trường và quyền truy cập quy trình.",
        "primary_role": "Vai trò chính",
        "progress": {
          "preparing_back": "Đang chuẩn bị mặt sau CCCD...",
          "preparing_face": "Đang chuẩn bị ảnh khuôn mặt...",
          "preparing_front": "Đang chuẩn bị mặt trước CCCD...",
          "saving_profile": "Đang lưu hồ sơ..."
        },
        "resubmit_kyc": "Gửi lại KYC",
        "role_change_note": "Thay đổi vai trò có thể ảnh hưởng đến nội dung bạn được truy cập và gửi.",
        "role_descriptions": {
          "admin": "Rà soát KYC, kiểm duyệt tài sản và quản lý tuân thủ.",
          "advisor": "Hỗ trợ bên bán, bên mua và quy trình giao dịch.",
          "buyer": "Truy cập cơ hội thị trường và yêu cầu truy cập NDA.",
          "seller": "Gửi tài sản và quản lý quy trình thương vụ riêng tư."
        },
        "save_profile": "Lưu hồ sơ",
        "security": {
          "cccd_review_text": "Hai mặt CCCD được kiểm tra để bảo đảm thông tin danh tính dễ đọc.",
          "cccd_review_title": "Rà soát CCCD",
          "face_capture_text": "Ảnh khuôn mặt hỗ trợ đối chiếu danh tính thủ công.",
          "face_capture_title": "Chụp khuôn mặt",
          "manual_review_text": "Quản trị viên tuân thủ sẽ phê duyệt hoặc từ chối hồ sơ.",
          "manual_review_title": "Rà soát thủ công"
        },
        "start_verification": "Bắt đầu xác minh",
        "submit_kyc": "Gửi KYC",
        "title": "Hồ sơ & xác minh",
        "unnamed_user": "Người dùng chưa đặt tên",
        "user_avatar": "Ảnh đại diện người dùng",
        "verification": "Xác minh",
        "verification_notes": "Ghi chú xác minh",
        "verification_notes_description": "Quản trị viên có thể cần thời gian rà soát sau khi bạn gửi. Hãy bảo đảm tài liệu rõ và dễ đọc."
      },
      "roles": {
        "admin": "Quản trị",
        "advisor": "Cố vấn",
        "buyer": "Bên mua",
        "seller": "Bên bán"
      },
      "statuses": {
        "deals": {
          "draft": "Bản nháp",
          "under_review": "Đang rà soát",
          "approved": "Đã phê duyệt",
          "published": "Đã công bố",
          "closed": "Đã đóng",
          "rejected": "Bị từ chối"
        },
        "nda": {
          "requested": "Đã yêu cầu",
          "signed": "Đã ký",
          "rejected": "Bị từ chối",
          "pending": "Đang chờ"
        }
      },
      "debug": {
        "nda_debug": "Debug NDA",
        "summary": "Tóm tắt",
        "all_ndas": "Tất cả NDA",
        "profile": "Hồ sơ",
        "my_ndas": "NDA của tôi",
        "deals": "Thương vụ",
        "create_test": "Tạo mẫu test",
        "logs": "Nhật ký",
        "clear": "Xóa",
        "empty": "Nhấn một nút để debug..."
      }
    }
  }
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
