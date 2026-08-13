/* ------------------------------------------------------------------
   Japan Adventurer — requirements capture: flow definition
   ------------------------------------------------------------------
   This file is the whole question model. Nothing in index.html knows
   what the questions are; it only knows how to render types and
   evaluate `showIf`. Change a tour type here, not in the engine.

   Loaded as a plain <script> so it works from file:// as well as a
   hosted URL — no fetch, no CORS.

   showIf grammar (deliberately tiny, so it can be authored in a
   spreadsheet later and compiled to this shape):

     { all: [cond, ...] }    every cond must pass
     { any: [cond, ...] }    at least one cond must pass

   cond:
     { q: "id", eq: value }        answer equals value
     { q: "id", in: [v, ...] }     answer is one of
     { q: "id", has: value }       multi-select answer contains value
     { q: "id", hasAny: [v, ...] } multi-select intersects
     { q: "id", gt: number }       numeric answer greater than
     { q: "id", answered: true }   any non-empty answer

   Question types: choice, multi, text, longtext, date, month, counter,
   rooms, notice.
   ------------------------------------------------------------------ */

window.JA_FLOW = {
  version: "0.5-demo",
  title: "Tell us what you are looking for",
  intro:
    "The questions adapt as you go, so you should only see what applies to your enquiry. If a question is hard to answer, ask about it and we will answer it here.",

  sections: [
    { id: "who", label: "Who is enquiring" },
    { id: "b_who", label: "Your organisation" },
    { id: "b_ask", label: "What you need" },
    { id: "b_brief", label: "Your brief" },
    { id: "b_group", label: "The group" },
    { id: "b_when", label: "Dates and departures" },
    { id: "b_purpose", label: "Purpose" },
    { id: "b_scope", label: "Scope of work" },
    { id: "b_comm", label: "Commercial structure" },
    { id: "b_process", label: "Decision and timeline" },
    { id: "b_close", label: "Trade enquiry — anything else" },
    { id: "shape", label: "Trip shape" },
    { id: "day", label: "Your day" },
    { id: "dates", label: "Dates and flights" },
    { id: "ground", label: "On the ground" },
    { id: "stay", label: "Staying overnight" },
    { id: "close", label: "Anything else" }
  ],

  questions: [
    /* ---------- spine: asked of everyone ---------- */
    {
      id: "party_type",
      section: "who",
      label: "Who is this enquiry for?",
      type: "choice",
      options: [
        { value: "b2c_self", label: "I am planning my own trip" },
        { value: "b2b_agent", label: "I am a travel agent or DMC" },
        { value: "b2b_group", label: "A school, club, company or other organisation" }
      ],
      required: true
    },
    {
      id: "trip_type",
      section: "shape",
      label: "What are you looking for?",
      type: "choice",
      showIf: { all: [{ q: "party_type", eq: "b2c_self" }] },
      options: [
        { value: "single_day", label: "A single day out, guided" },
        { value: "multi_day", label: "A multi-day itinerary" },
        { value: "unsure", label: "I am not sure yet" }
      ],
      required: true,
      help:
        "This is the one answer that decides most of what follows. A single day out does not need date ranges, airports or room allocation."
    },
    {
      id: "unsure_help",
      section: "shape",
      type: "notice",
      showIf: { all: [{ q: "trip_type", eq: "unsure" }] },
      label: "Ask about this and we will narrow it down",
      body:
        "Tell us roughly how long you are in Japan and what you want out of it, and we will tell you which of the two fits. Use ask about this below.",
      assist: true
    },
    {
      id: "adults",
      section: "shape",
      label: "How many adults?",
      type: "counter",
      min: 1,
      max: 20,
      default: 2,
      showIf: { all: [{ q: "trip_type", in: ["single_day", "multi_day"] }] },
      required: true
    },
    {
      id: "children",
      section: "shape",
      label: "How many children under 16?",
      type: "counter",
      min: 0,
      max: 12,
      default: 0,
      showIf: { all: [{ q: "trip_type", in: ["single_day", "multi_day"] }] }
    },
    {
      id: "child_ages",
      section: "shape",
      label: "Ages of the children travelling",
      hint: "Ages change what we can include, particularly on cycling and boat activities.",
      type: "text",
      placeholder: "8, 12",
      showIf: { all: [{ q: "children", gt: 0 }] },
      required: true
    },
    {
      id: "home_country",
      section: "shape",
      label: "Which country are you travelling from?",
      type: "text",
      placeholder: "United Kingdom",
      showIf: { all: [{ q: "trip_type", in: ["single_day", "multi_day"] }] },
      required: true
    },

    /* ---------- single-day branch ---------- */
    {
      id: "sd_date",
      section: "day",
      label: "Which date?",
      type: "date",
      showIf: { all: [{ q: "trip_type", eq: "single_day" }] },
      required: true
    },
    {
      id: "sd_base",
      section: "day",
      label: "Where are you staying the night before?",
      hint: "Town or hotel name is enough. This is how we work out where we can collect you.",
      type: "text",
      placeholder: "Matsuyama",
      showIf: { all: [{ q: "trip_type", eq: "single_day" }] },
      required: true,
      assist: true,
      assistLabel: "I am not sure where to base myself"
    },
    {
      id: "sd_theme",
      section: "day",
      label: "What would you like the day to be built around?",
      type: "multi",
      options: [
        { value: "sake_food", label: "Sake and food" },
        { value: "coastal", label: "Coastal and island routes" },
        { value: "trekking", label: "Trekking" },
        { value: "cycling", label: "Cycling" },
        { value: "fishing", label: "Fishing" },
        { value: "makers", label: "Local makers and workshops" },
        { value: "temple_route", label: "Temple routes and old highways" },
        { value: "other", label: "Something else" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "single_day" }] },
      required: true
    },
    {
      id: "sd_fitness",
      section: "day",
      label: "How active a day suits the group?",
      hint: "Asked because you selected trekking or cycling.",
      type: "choice",
      options: [
        { value: "easy", label: "Easy — level ground, short distances" },
        { value: "moderate", label: "Moderate — some ascent, half a day of walking or riding" },
        { value: "full", label: "Full — a demanding day is fine" }
      ],
      showIf: { all: [{ q: "sd_theme", hasAny: ["trekking", "cycling"] }] },
      required: true
    },
    {
      id: "sd_mobility",
      section: "day",
      label: "Anyone in the group with mobility or health limits we should plan around?",
      type: "text",
      placeholder: "None",
      showIf: { all: [{ q: "trip_type", eq: "single_day" }] }
    },
    {
      id: "sd_start",
      section: "day",
      label: "What sort of start time works?",
      type: "choice",
      options: [
        { value: "early", label: "Early — before 08:00" },
        { value: "standard", label: "Standard — around 09:00" },
        { value: "late", label: "Later morning" },
        { value: "flexible", label: "Flexible" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "single_day" }] },
      required: true
    },

    /* ---------- multi-day branch ---------- */
    {
      id: "md_certainty",
      section: "dates",
      label: "How settled are your dates?",
      type: "choice",
      options: [
        { value: "exact", label: "Fixed — I know both dates" },
        { value: "approximate", label: "Roughly — I know the month" },
        { value: "unsure", label: "Open — I am choosing when to come" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true
    },
    {
      id: "md_start_date",
      section: "dates",
      label: "First day in Japan",
      type: "date",
      showIf: { all: [{ q: "md_certainty", eq: "exact" }] },
      required: true
    },
    {
      id: "md_end_date",
      section: "dates",
      label: "Last day in Japan",
      type: "date",
      showIf: { all: [{ q: "md_certainty", eq: "exact" }] },
      required: true
    },
    {
      id: "md_month",
      section: "dates",
      label: "Which month?",
      type: "month",
      showIf: { all: [{ q: "md_certainty", eq: "approximate" }] },
      required: true
    },
    {
      id: "md_flex",
      section: "dates",
      label: "How much can those dates move?",
      type: "choice",
      options: [
        { value: "d3", label: "A few days either way" },
        { value: "w2", label: "A couple of weeks" },
        { value: "any", label: "Anywhere in the month" }
      ],
      showIf: { all: [{ q: "md_certainty", eq: "approximate" }] },
      required: true
    },
    {
      id: "md_season",
      section: "dates",
      label: "What matters more, weather or quieter roads?",
      type: "choice",
      options: [
        { value: "weather", label: "Best conditions for being outdoors" },
        { value: "quiet", label: "Fewer people, even if conditions are mixed" },
        { value: "specific", label: "Something specific — I will explain below" }
      ],
      showIf: { all: [{ q: "md_certainty", eq: "unsure" }] },
      required: true,
      assist: true,
      assistLabel: "When should I come?"
    },
    {
      id: "md_nights",
      section: "dates",
      label: "How many nights are you asking us to plan?",
      hint: "Only the part you want Japan Adventurer to arrange.",
      type: "counter",
      min: 1,
      max: 30,
      default: 7,
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true
    },
    {
      id: "md_flights",
      section: "dates",
      label: "Are your flights booked?",
      type: "choice",
      options: [
        { value: "yes", label: "Booked" },
        { value: "no", label: "Not yet" },
        { value: "researching", label: "Still looking at options" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true,
      help:
        "The old form asked every customer for arrival and departure airports. Most cannot answer that yet, so they left it blank. Here it is only asked if you said your flights are booked."
    },
    {
      id: "md_arrival",
      section: "dates",
      label: "Arrival airport",
      type: "text",
      placeholder: "Kansai",
      showIf: { all: [{ q: "md_flights", eq: "yes" }] },
      required: true
    },
    {
      id: "md_departure",
      section: "dates",
      label: "Departure airport",
      type: "text",
      placeholder: "Haneda",
      showIf: { all: [{ q: "md_flights", eq: "yes" }] },
      required: true
    },
    {
      id: "md_airport_help",
      section: "dates",
      type: "notice",
      label: "We will suggest where to fly in and out",
      body:
        "Because your flights are not booked, we will propose entry and exit points once we know which regions you want. Ask about it below if you want a view now.",
      showIf: { all: [{ q: "md_flights", in: ["no", "researching"] }] },
      assist: true,
      assistLabel: "Which airports should I be looking at?"
    },
    {
      id: "md_regions",
      section: "ground",
      label: "Which regions are you interested in?",
      type: "multi",
      options: [
        { value: "shikoku", label: "Shikoku" },
        { value: "setouchi", label: "Setouchi islands" },
        { value: "kii", label: "Kii peninsula" },
        { value: "alps", label: "Japan Alps" },
        { value: "sanin", label: "San'in coast" },
        { value: "kyushu", label: "Kyushu" },
        { value: "cities", label: "Tokyo, Kyoto or Osaka as well" },
        { value: "open", label: "Open to suggestions" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true,
      assist: true,
      assistLabel: "Is this too much for the time I have?"
    },
    {
      id: "md_themes",
      section: "ground",
      label: "What should the itinerary be built around?",
      type: "multi",
      options: [
        { value: "sake_food", label: "Sake and food" },
        { value: "coastal", label: "Coastal and island routes" },
        { value: "trekking", label: "Trekking" },
        { value: "cycling", label: "Cycling" },
        { value: "fishing", label: "Fishing" },
        { value: "makers", label: "Local makers and workshops" },
        { value: "temple_route", label: "Temple routes and old highways" },
        { value: "quiet", label: "Comfort and low pace" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true
    },
    {
      id: "md_fitness",
      section: "ground",
      label: "How active should the itinerary be?",
      hint: "Asked because you selected trekking or cycling.",
      type: "choice",
      options: [
        { value: "easy", label: "Easy — level ground, short distances" },
        { value: "moderate", label: "Moderate — some ascent most days" },
        { value: "full", label: "Full — demanding days are fine" }
      ],
      showIf: { all: [{ q: "md_themes", hasAny: ["trekking", "cycling"] }] },
      required: true
    },
    {
      id: "md_rooms",
      section: "stay",
      label: "How should we allocate rooms?",
      hint: "Checked against your group size, so nothing arrives at the hotel wrong.",
      type: "rooms",
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true,
      help:
        "In the old form this was one free-text box reading 'specify Single, Double and Twin'. A test response answered it with the number 2, which cannot be booked against. Structured counters plus a check against group size removes the email round trip."
    },
    {
      id: "md_room_style",
      section: "stay",
      label: "Is a Japanese-style room acceptable?",
      hint: "Futon on tatami rather than beds. Common in ryokan and in smaller places where there is no alternative.",
      type: "choice",
      options: [
        { value: "yes", label: "Yes, throughout" },
        { value: "some", label: "For a night or two" },
        { value: "no", label: "Beds only" },
        { value: "unsure", label: "I do not know what this means" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true,
      assist: true,
      assistLabel: "What is a Japanese-style room like?"
    },
    {
      id: "md_category",
      section: "stay",
      label: "What standard of accommodation are you expecting?",
      type: "choice",
      options: [
        { value: "simple", label: "Simple and clean is fine" },
        { value: "mid", label: "Comfortable, well-run" },
        { value: "upper", label: "Upper end where it is available" },
        { value: "mixed", label: "Mixed — best available in each place" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true,
      assist: true,
      assistLabel: "What do these standards actually mean in rural Japan?"
    },
    {
      id: "md_diet",
      section: "stay",
      label: "Any dietary requirements or allergies?",
      type: "multi",
      options: [
        { value: "none", label: "None" },
        { value: "vegetarian", label: "Vegetarian" },
        { value: "vegan", label: "Vegan" },
        { value: "no_fish", label: "No fish or seafood" },
        { value: "gluten", label: "Gluten" },
        { value: "nuts", label: "Nuts" },
        { value: "other", label: "Other — described below" }
      ],
      showIf: { all: [{ q: "trip_type", eq: "multi_day" }] },
      required: true
    },
    {
      id: "md_diet_detail",
      section: "stay",
      label: "Describe the requirement, and how strict it is",
      hint: "Rural kitchens need this in advance, and dashi makes strict vegetarian and no-fish requests harder than they look.",
      type: "longtext",
      showIf: {
        all: [{ q: "md_diet", hasAny: ["vegetarian", "vegan", "no_fish", "gluten", "nuts", "other"] }]
      },
      required: true
    },

    /* ---------- close: asked of everyone who got this far ---------- */
    {
      id: "contact_name",
      section: "close",
      label: "Your name",
      type: "text",
      showIf: { all: [{ q: "trip_type", in: ["single_day", "multi_day"] }] },
      required: true
    },
    {
      id: "contact_email",
      section: "close",
      label: "Email",
      type: "text",
      placeholder: "you@example.com",
      showIf: { all: [{ q: "trip_type", in: ["single_day", "multi_day"] }] },
      required: true
    },
    {
      id: "source",
      section: "close",
      label: "How did you come across us?",
      hint: "A list rather than a text box, so it can actually be counted.",
      type: "choice",
      options: [
        { value: "search", label: "Search engine" },
        { value: "ai", label: "An AI assistant recommended you" },
        { value: "agent", label: "Through a travel agent" },
        { value: "referral", label: "Recommended by someone" },
        { value: "social", label: "Social media" },
        { value: "repeat", label: "I have travelled with you before" },
        { value: "other", label: "Other" }
      ],
      showIf: { all: [{ q: "trip_type", in: ["single_day", "multi_day"] }] },
      required: true
    },
    {
      id: "notes",
      section: "close",
      label: "Anything else we should know?",
      type: "longtext",
      showIf: { all: [{ q: "trip_type", in: ["single_day", "multi_day"] }] }
    },

    /* ================================================================
       B2B branch — trade, group and institutional enquiries.

       Branches on three axes, not on trip type:
         b_org_type   who they are      (reseller / brand / institution)
         b_maturity   how firm the brief is
         b_need       what they want back

       Purpose is a single question gating four sub-blocks, so adding a
       fourth purpose later is a block rather than a form.

       Written against three live discussions: ABSA (sports exchange),
       Kammui (fixed itinerary to cost), Shailer Park (school study tour).
       ================================================================ */

    /* ---------- who they are ---------- */
    {
      id: "b_org_name",
      section: "b_who",
      label: "Organisation name",
      type: "text",
      showIf: { all: [{ q: "party_type", in: ["b2b_agent", "b2b_group"] }] },
      required: true
    },
    {
      id: "b_org_type",
      section: "b_who",
      label: "Which of these describes you best?",
      hint: "This decides most of what follows. A reseller and an institution travelling itself need different things from us.",
      type: "choice",
      options: [
        { value: "operator_reseller", label: "Tour operator or agency selling to your own customers" },
        { value: "brand_curator", label: "Travel brand building an itinerary you will sell under your own name" },
        { value: "school", label: "School, university or educational institution" },
        { value: "club_corporate", label: "Club, team, association or company travelling ourselves" },
        { value: "dmc_inbound", label: "DMC or inbound agent placing a client's group" },
        { value: "other", label: "Something else" }
      ],
      showIf: { all: [{ q: "party_type", in: ["b2b_agent", "b2b_group"] }] },
      required: true
    },
    {
      id: "b_country",
      section: "b_who",
      label: "Which market are you selling from?",
      type: "text",
      placeholder: "Australia",
      showIf: { all: [{ q: "b_org_type", answered: true }] },
      required: true
    },
    {
      id: "b_relationship",
      section: "b_who",
      label: "Have we worked together before?",
      type: "choice",
      options: [
        { value: "first", label: "This is first contact" },
        { value: "in_touch", label: "We have been in touch" },
        { value: "existing", label: "We are an existing partner" }
      ],
      showIf: { all: [{ q: "b_org_type", answered: true }] },
      required: true
    },

    /* ---------- what they want back ---------- */
    {
      id: "b_need",
      section: "b_ask",
      label: "What do you need from us?",
      hint: "Select everything that applies. A costed estimate and a full proposal are different pieces of work.",
      type: "multi",
      options: [
        { value: "estimate", label: "Costs against an itinerary we already have" },
        { value: "full_proposal", label: "A full proposal: itinerary, costs, logistics" },
        { value: "local_partner", label: "A local partner for a project we are developing" },
        { value: "site_inspection", label: "A site inspection or familiarisation visit" },
        { value: "availability", label: "Availability and feasibility only" },
        { value: "talk_first", label: "Not sure yet — we would rather talk" }
      ],
      showIf: { all: [{ q: "b_org_type", answered: true }] },
      required: true
    },

    /* ---------- how firm the brief is ---------- */
    {
      id: "b_maturity",
      section: "b_brief",
      label: "How settled is the trip?",
      type: "choice",
      options: [
        { value: "fixed_itinerary", label: "We have an itinerary and need it costed" },
        { value: "prior_itinerary", label: "We have run something similar and want it improved" },
        { value: "concept_dates", label: "We have an objective and a date, but no route" },
        { value: "exploratory", label: "Early stage — no dates yet" }
      ],
      showIf: { all: [{ q: "b_need", answered: true }] },
      required: true
    },
    {
      id: "b_brief_paste",
      section: "b_brief",
      label: "Paste your itinerary, brief or request for proposal here",
      hint: "Anything you have already written. We will read it and fill in what we can, so you are correcting rather than retyping.",
      type: "longtext",
      showIf: { all: [{ q: "b_maturity", in: ["fixed_itinerary", "prior_itinerary"] }] },
      required: true
    },
    {
      id: "b_fixed_elements",
      section: "b_brief",
      label: "Which parts are fixed, and which can we change?",
      hint: "Worth being honest here. Some things we may need to change for reasons on the ground rather than preference.",
      type: "multi",
      options: [
        { value: "dates", label: "Dates" },
        { value: "route", label: "Route and regions" },
        { value: "accommodation", label: "Accommodation standard" },
        { value: "experiences", label: "Specific experiences named in the brief" },
        { value: "price_point", label: "Price point" },
        { value: "nothing", label: "Nothing is fixed yet" }
      ],
      showIf: { all: [{ q: "b_maturity", in: ["fixed_itinerary", "prior_itinerary"] }] },
      required: true,
      assist: true,
      assistLabel: "What usually has to change, and why?"
    },
    {
      id: "b_change_wanted",
      section: "b_brief",
      label: "What would you change from last time?",
      hint: "Including anything that did not work. That is often more useful than what did.",
      type: "longtext",
      showIf: { all: [{ q: "b_maturity", eq: "prior_itinerary" }] },
      required: true
    },
    {
      id: "b_objectives",
      section: "b_brief",
      label: "What does this trip have to achieve?",
      hint: "The objective rather than the itinerary. We will propose the route.",
      type: "longtext",
      showIf: { all: [{ q: "b_maturity", in: ["concept_dates", "exploratory"] }] },
      required: true
    },

    /* ---------- the group ---------- */
    {
      id: "b_size_known",
      section: "b_group",
      label: "Do you know the group size?",
      type: "choice",
      options: [
        { value: "exact", label: "Yes, an exact number" },
        { value: "band", label: "A range rather than a number" },
        { value: "unknown", label: "Not yet" }
      ],
      showIf: { all: [{ q: "b_maturity", answered: true }] },
      required: true
    },
    {
      id: "b_size_exact",
      section: "b_group",
      label: "How many people in total?",
      hint: "Including staff and accompanying adults.",
      type: "counter",
      min: 1,
      max: 200,
      showIf: { all: [{ q: "b_size_known", eq: "exact" }] },
      required: true
    },
    {
      id: "b_size_band",
      section: "b_group",
      label: "Roughly what size?",
      hint: "Pricing changes across these bands, so a range is genuinely useful even without a final number.",
      type: "choice",
      options: [
        { value: "u10", label: "Under 10" },
        { value: "10_20", label: "10 to 20" },
        { value: "20_30", label: "20 to 30" },
        { value: "30_50", label: "30 to 50" },
        { value: "50p", label: "More than 50" }
      ],
      showIf: { all: [{ q: "b_size_known", eq: "band" }] },
      required: true
    },
    {
      id: "b_composition",
      section: "b_group",
      label: "Who is travelling?",
      type: "multi",
      options: [
        { value: "adults", label: "Adults only" },
        { value: "families", label: "Families with children" },
        { value: "under18", label: "Participants under 18" },
        { value: "students", label: "Students" },
        { value: "staff", label: "Accompanying staff or teachers" },
        { value: "supporters", label: "Spectators or supporters" }
      ],
      showIf: { all: [{ q: "b_size_known", answered: true }] },
      required: true
    },
    {
      id: "b_origin",
      section: "b_group",
      label: "Where does the group depart from?",
      hint: "The nearest major airport is enough. Routing into Japan often decides where an itinerary can start and end.",
      type: "text",
      placeholder: "Brisbane",
      showIf: { all: [{ q: "b_composition", answered: true }] },
      required: true,
      assist: true,
      assistLabel: "Which Japanese airport should we route into?"
    },
    {
      id: "b_japan_experience",
      section: "b_group",
      label: "How much travelling has the group done?",
      hint: "This changes the briefing material rather than the itinerary. Groups travelling internationally for the first time need to know what to expect before they commit.",
      type: "choice",
      options: [
        { value: "new_japan", label: "Most have not been to Japan" },
        { value: "new_abroad", label: "Most have not travelled internationally" },
        { value: "experienced", label: "Experienced travellers" },
        { value: "mixed", label: "Mixed" }
      ],
      showIf: { all: [{ q: "b_composition", answered: true }] }
    },

    /* ---------- duty of care: only when minors are travelling ---------- */
    {
      id: "b_supervision_ratio",
      section: "b_group",
      label: "What supervision ratio do you have to meet?",
      hint: "Asked because the group includes participants under 18.",
      type: "text",
      placeholder: "1 adult to 8 students",
      showIf: { all: [{ q: "b_composition", hasAny: ["under18", "students"] }] },
      required: true
    },
    {
      id: "b_safeguarding",
      section: "b_group",
      label: "What do you need us to provide on duty of care?",
      type: "multi",
      options: [
        { value: "checked_staff", label: "Background-checked staff" },
        { value: "risk_assessment", label: "Written risk assessment" },
        { value: "emergency_contact", label: "24 hour emergency contact in Japan" },
        { value: "medical", label: "Medical cover arrangements" },
        { value: "consent", label: "Parental consent handling" }
      ],
      showIf: { all: [{ q: "b_composition", hasAny: ["under18", "students"] }] },
      required: true
    },
    {
      id: "b_insurance_constraint",
      section: "b_group",
      label: "How is travel insurance handled?",
      hint: "Some institutions are required to use a named provider. If so we will leave it out rather than quote something you cannot buy.",
      type: "choice",
      options: [
        { value: "mandated", label: "We must use a provider we are given" },
        { value: "arrange", label: "We need you to arrange it" },
        { value: "undecided", label: "Not decided" }
      ],
      showIf: { all: [{ q: "b_composition", hasAny: ["under18", "students"] }] },
      required: true
    },

    /* ---------- dates and departures ---------- */
    {
      id: "b_dates_firmness",
      section: "b_when",
      label: "How fixed are the dates?",
      type: "choice",
      options: [
        { value: "fixed", label: "Fixed" },
        { value: "window", label: "A window we work within" },
        { value: "flexible", label: "Flexible" },
        { value: "not_set", label: "Not set yet" }
      ],
      showIf: { all: [{ q: "b_composition", answered: true }] },
      required: true
    },
    {
      id: "b_date_from",
      section: "b_when",
      label: "Earliest date",
      type: "date",
      showIf: { all: [{ q: "b_dates_firmness", in: ["fixed", "window"] }] },
      required: true
    },
    {
      id: "b_date_to",
      section: "b_when",
      label: "Latest date",
      type: "date",
      showIf: { all: [{ q: "b_dates_firmness", in: ["fixed", "window"] }] },
      required: true
    },
    {
      id: "b_nights",
      section: "b_when",
      label: "How many nights in Japan?",
      type: "counter",
      min: 1,
      max: 30,
      showIf: { all: [{ q: "b_dates_firmness", in: ["fixed", "window", "flexible"] }] },
      required: true
    },
    {
      id: "b_frequency",
      section: "b_when",
      label: "Is this a one-off or the start of something recurring?",
      hint: "A single departure and a programme are quoted differently, so it is worth saying now.",
      type: "choice",
      options: [
        { value: "one_off", label: "One-off" },
        { value: "annual", label: "Annual or recurring" },
        { value: "multiple", label: "Several departures a year" },
        { value: "pilot", label: "A pilot first, then scale" }
      ],
      showIf: { all: [{ q: "b_dates_firmness", answered: true }] },
      required: true
    },

    /* ---------- purpose: one question, four sub-blocks ---------- */
    {
      id: "b_purpose",
      section: "b_purpose",
      label: "What is the trip built around?",
      type: "multi",
      options: [
        { value: "sport", label: "Sport or competition" },
        { value: "education", label: "Education or study" },
        { value: "culture", label: "Food and culture" },
        { value: "outdoor", label: "Outdoor and active" },
        { value: "corporate", label: "Corporate or incentive" },
        { value: "special", label: "Faith or special interest" },
        { value: "other", label: "Something else" }
      ],
      showIf: { all: [{ q: "b_frequency", answered: true }] },
      required: true
    },

    /* sport */
    {
      id: "b_sport",
      section: "b_purpose",
      label: "Which sport?",
      type: "text",
      placeholder: "Women's softball",
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },
    {
      id: "b_games_count",
      section: "b_purpose",
      label: "How many games or fixtures?",
      type: "counter",
      min: 0,
      max: 20,
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },
    {
      id: "b_level",
      section: "b_purpose",
      label: "What level does the group play at?",
      type: "choice",
      options: [
        { value: "school", label: "School" },
        { value: "club", label: "Club amateur" },
        { value: "semi_pro", label: "Semi-professional" },
        { value: "mixed", label: "Mixed ability" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },
    {
      id: "b_age_gender",
      section: "b_purpose",
      label: "Age group and category",
      type: "text",
      placeholder: "Girls under 16",
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },
    {
      id: "b_opponent_pref",
      section: "b_purpose",
      label: "What standard of opposition suits you?",
      type: "choice",
      options: [
        { value: "similar", label: "Similar standard" },
        { value: "stronger", label: "Stronger — the challenge is the point" },
        { value: "mixed", label: "A mix" },
        { value: "any", label: "Not important" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },
    {
      id: "b_rest_days",
      section: "b_purpose",
      label: "Can the group play on consecutive days?",
      hint: "This decides how far apart the host regions can be, so it shapes the route as much as the schedule.",
      type: "choice",
      options: [
        { value: "consecutive_ok", label: "Consecutive days are fine" },
        { value: "rest_day", label: "At least one rest day between games" },
        { value: "spread", label: "Prefer them spread out" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },
    {
      id: "b_venue_needs",
      section: "b_purpose",
      label: "Anything the venues have to provide?",
      type: "longtext",
      showIf: { all: [{ q: "b_purpose", has: "sport" }] }
    },
    {
      id: "b_kit_logistics",
      section: "b_purpose",
      label: "What do you need handled around kit and welfare?",
      hint: "Uniform laundering between fixtures is the one most groups forget until they are here.",
      type: "multi",
      options: [
        { value: "laundry", label: "Uniform laundering" },
        { value: "equipment", label: "Equipment transport" },
        { value: "medical", label: "Medical or physiotherapy cover" },
        { value: "none", label: "Nothing special" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },
    {
      id: "b_supporters",
      section: "b_purpose",
      label: "Is anyone travelling who is not competing?",
      type: "choice",
      options: [
        { value: "players_only", label: "Players and staff only" },
        { value: "families", label: "Families travelling alongside" },
        { value: "separate_programme", label: "Families travelling, and they need their own programme" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "sport" }] },
      required: true
    },

    /* education */
    {
      id: "b_year_levels",
      section: "b_purpose",
      label: "Which year levels?",
      type: "text",
      placeholder: "Years 5 and 6",
      showIf: { all: [{ q: "b_purpose", has: "education" }] },
      required: true
    },
    {
      id: "b_curriculum_link",
      section: "b_purpose",
      label: "What does the tour need to connect to?",
      type: "multi",
      options: [
        { value: "language", label: "Language study" },
        { value: "history", label: "History" },
        { value: "stem", label: "Science and technology" },
        { value: "arts", label: "Arts and design" },
        { value: "general", label: "General cultural exposure" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "education" }] },
      required: true
    },
    {
      id: "b_school_exchange",
      section: "b_purpose",
      label: "Do you want contact with Japanese students?",
      type: "choice",
      options: [
        { value: "visit", label: "A school visit" },
        { value: "exchange", label: "An exchange with local students" },
        { value: "homestay", label: "Homestay" },
        { value: "none", label: "Not required" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "education" }] },
      required: true
    },
    {
      id: "b_reporting",
      section: "b_purpose",
      label: "What do you need from us outside the tour itself?",
      type: "multi",
      options: [
        { value: "briefing", label: "Pre-departure briefing material" },
        { value: "risk_docs", label: "Risk documentation" },
        { value: "post_report", label: "Post-tour report" },
        { value: "parent_evening", label: "Material for a parent information evening" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "education" }] },
      required: true
    },

    /* experiential */
    {
      id: "b_themes",
      section: "b_purpose",
      label: "What should the itinerary be built around?",
      type: "multi",
      options: [
        { value: "food", label: "Food and drink" },
        { value: "craft", label: "Craft and makers" },
        { value: "landscape", label: "Landscape and walking" },
        { value: "cycling", label: "Cycling" },
        { value: "islands", label: "Islands and the Inland Sea" },
        { value: "rural", label: "Rural stays" },
        { value: "art", label: "Art" }
      ],
      showIf: { all: [{ q: "b_purpose", hasAny: ["culture", "outdoor"] }] },
      required: true
    },
    {
      id: "b_pace",
      section: "b_purpose",
      label: "What pace suits the group?",
      type: "choice",
      options: [
        { value: "full", label: "Full — cover as much as the days allow" },
        { value: "balanced", label: "Balanced" },
        { value: "unhurried", label: "Unhurried — fewer places, longer in each" }
      ],
      showIf: { all: [{ q: "b_purpose", hasAny: ["culture", "outdoor"] }] },
      required: true
    },
    {
      id: "b_exclusivity",
      section: "b_purpose",
      label: "How private does it need to be?",
      type: "choice",
      options: [
        { value: "private", label: "Private throughout" },
        { value: "mostly", label: "Mostly private" },
        { value: "shared", label: "Shared arrangements are acceptable" }
      ],
      showIf: { all: [{ q: "b_purpose", hasAny: ["culture", "outdoor"] }] },
      required: true
    },
    {
      id: "b_comfort",
      section: "b_purpose",
      label: "What accommodation standard are you working to?",
      type: "choice",
      options: [
        { value: "3", label: "3 star" },
        { value: "34", label: "3 to 4 star" },
        { value: "45", label: "4 to 5 star" },
        { value: "character", label: "Ryokan and character stays" },
        { value: "mixed", label: "Mixed, depending on the location" }
      ],
      showIf: { all: [{ q: "b_purpose", hasAny: ["culture", "outdoor"] }] },
      required: true,
      assist: true,
      assistLabel: "What is actually available in rural Shikoku?"
    },

    /* corporate */
    {
      id: "b_event_component",
      section: "b_purpose",
      label: "Is there an event element?",
      type: "multi",
      options: [
        { value: "meeting", label: "Meeting space" },
        { value: "dinner", label: "Awards or gala dinner" },
        { value: "team", label: "Team activity" },
        { value: "conference", label: "Conference" },
        { value: "none", label: "None" }
      ],
      showIf: { all: [{ q: "b_purpose", has: "corporate" }] },
      required: true
    },

    /* ---------- scope of work: the commercial hinge ---------- */
    {
      id: "b_scope",
      section: "b_scope",
      label: "What would you like us to handle?",
      hint: "Select everything that applies. Some of these sit outside a normal land operation and are priced differently.",
      type: "multi",
      options: [
        { value: "land", label: "Land operation — itinerary, hotels, transport, guides, meals" },
        { value: "flights", label: "Flights" },
        { value: "partner_sourcing", label: "Sourcing and negotiating with local partners" },
        { value: "local_rep", label: "Acting as your representative in Japan" },
        { value: "event_planning", label: "Event planning and coordination" },
        { value: "marketing", label: "Photography and marketing material" },
        { value: "inspection", label: "Hosting a site inspection" },
        { value: "staffing", label: "Recruiting staff for the event" },
        { value: "group_leader", label: "A group leader travelling throughout" },
        { value: "risk", label: "Risk management and emergency support" }
      ],
      showIf: { all: [{ q: "b_purpose", answered: true }] },
      required: true
    },
    {
      id: "b_prep_phase",
      section: "b_scope",
      label: "Is there a preparation period before the tour that needs work from us?",
      hint: "Coordination, venue research and representation ahead of a departure sit outside a tour price. Saying so now avoids a quote that has to be unpicked later.",
      type: "choice",
      options: [
        { value: "substantial", label: "Yes, substantial — ongoing work over months or years" },
        { value: "light", label: "Yes, but light" },
        { value: "none", label: "No — the tour itself is the work" }
      ],
      showIf: { all: [{ q: "b_scope", answered: true }] },
      required: true,
      assist: true,
      assistLabel: "What counts as preparation work?"
    },
    {
      id: "b_prep_duration",
      section: "b_scope",
      label: "Over what period?",
      type: "choice",
      options: [
        { value: "u6m", label: "Under 6 months" },
        { value: "6_12m", label: "6 to 12 months" },
        { value: "1_2y", label: "1 to 2 years" },
        { value: "2yp", label: "More than 2 years" }
      ],
      showIf: { all: [{ q: "b_prep_phase", in: ["substantial", "light"] }] },
      required: true
    },

    /* ---------- commercial structure ---------- */
    {
      id: "b_pricing_basis",
      section: "b_comm",
      label: "How do you need this priced?",
      type: "choice",
      options: [
        { value: "per_person", label: "Per person" },
        { value: "per_group", label: "Per group" },
        { value: "size_band", label: "A package price by group size band" },
        { value: "net_margin", label: "Net rates, and we add our own margin" },
        { value: "commission", label: "Commission" },
        { value: "unsure", label: "Not sure yet" }
      ],
      showIf: { all: [{ q: "b_prep_phase", answered: true }] },
      required: true
    },
    {
      id: "b_brand",
      section: "b_comm",
      label: "Whose name is on the tour?",
      type: "choice",
      options: [
        { value: "yours", label: "Ours — you operate behind the scenes" },
        { value: "ours", label: "Yours" },
        { value: "co", label: "Both" },
        { value: "undecided", label: "Not decided" }
      ],
      showIf: { all: [{ q: "b_prep_phase", answered: true }] },
      required: true
    },
    {
      id: "b_prep_budget",
      section: "b_comm",
      label: "How is preparation and representation work usually budgeted on your side?",
      hint: "Asked because you told us there is a preparation period. It sits outside a tour price, and how it is funded is easier to agree now than after a quote.",
      type: "choice",
      options: [
        { value: "separate", label: "We allocate a separate budget for it" },
        { value: "inside_tour", label: "We expect it inside the tour price" },
        { value: "not_discussed", label: "It has not been discussed" }
      ],
      showIf: { all: [{ q: "b_prep_phase", in: ["substantial", "light"] }] },
      required: true
    },
    {
      id: "b_incumbent",
      section: "b_comm",
      label: "Do you work with a partner elsewhere whose arrangement we should match?",
      hint: "If you already have a structure that works in another country, describing it saves us both a round of guessing.",
      type: "longtext",
      showIf: {
        all: [{ q: "b_org_type", in: ["operator_reseller", "brand_curator", "dmc_inbound"] }]
      }
    },
    {
      id: "b_procurement",
      section: "b_comm",
      label: "Are there procurement rules we have to work within?",
      type: "multi",
      options: [
        { value: "insurer", label: "A named insurance provider we must use" },
        { value: "supplier_list", label: "An approved supplier list" },
        { value: "tender", label: "A formal tender process" },
        { value: "none", label: "No constraints" }
      ],
      showIf: { all: [{ q: "b_org_type", eq: "school" }] },
      required: true
    },

    /* ---------- decision and timeline ---------- */
    {
      id: "b_proposal_deadline",
      section: "b_process",
      label: "When do you need our proposal by?",
      type: "date",
      showIf: { all: [{ q: "b_pricing_basis", answered: true }] },
      required: true
    },
    {
      id: "b_decision_by",
      section: "b_process",
      label: "When do you expect to decide?",
      type: "month",
      showIf: { all: [{ q: "b_pricing_basis", answered: true }] }
    },
    {
      id: "b_next_step",
      section: "b_process",
      label: "What happens next if this looks like a fit?",
      type: "choice",
      options: [
        { value: "proposal", label: "We read the proposal, then decide" },
        { value: "call", label: "A call first" },
        { value: "visit", label: "A site visit first" },
        { value: "agreement", label: "Straight to a partnership agreement" }
      ],
      showIf: { all: [{ q: "b_pricing_basis", answered: true }] },
      required: true
    },

    /* ---------- close ---------- */
    {
      id: "b_prior_experience",
      section: "b_close",
      label: "Have you run something like this before?",
      hint: "Where, with whom, and what you would keep or avoid.",
      type: "longtext",
      showIf: {
        all: [
          { q: "b_maturity", in: ["fixed_itinerary", "concept_dates", "exploratory"] },
          { q: "b_pricing_basis", answered: true }
        ]
      }
    },
    {
      id: "b_contact_name",
      section: "b_close",
      label: "Your name",
      type: "text",
      showIf: { all: [{ q: "b_pricing_basis", answered: true }] },
      required: true
    },
    {
      id: "b_contact_email",
      section: "b_close",
      label: "Email",
      type: "text",
      placeholder: "you@example.com",
      showIf: { all: [{ q: "b_pricing_basis", answered: true }] },
      required: true
    },
    {
      id: "b_notes",
      section: "b_close",
      label: "Anything else we should know?",
      type: "longtext",
      showIf: { all: [{ q: "b_pricing_basis", answered: true }] }
    }
  ]
};
