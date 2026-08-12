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
  version: "0.4-demo",
  title: "Tell us what you are looking for",
  intro:
    "The questions adapt as you go, so you should only see what applies to your enquiry. If a question is hard to answer, ask about it and we will answer it here.",

  sections: [
    { id: "who", label: "Who is enquiring" },
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
      id: "b2b_notice",
      section: "who",
      type: "notice",
      showIf: { all: [{ q: "party_type", in: ["b2b_agent", "b2b_group"] }] },
      label: "Trade and group enquiries follow a different route",
      body:
        "Group and trade requirements vary too widely to put on a fixed form. This branch is where the AI-led interview belongs rather than a decision tree — it asks whatever it needs to in order to close the gaps, in any order. Not built in this prototype.",
      devNote:
        "B2B branch: intentionally a stub. See the notes panel for why a coverage checklist beats a tree here."
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
    }
  ]
};
