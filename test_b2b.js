/* Coverage test for the question model.
   Uses the REAL showIf evaluator lifted verbatim from index.html, so this
   tests the shipped logic rather than a reimplementation of it.
   Run: node test_b2b.js */

global.window = {};
require('./flow.js');
const FLOW = window.JA_FLOW;

/* --- verbatim from index.html --- */
function truthy(v){
  if(v===undefined||v===null) return false;
  if(Array.isArray(v)) return v.length>0;
  if(typeof v==='object') return Object.values(v).some(n=>Number(n)>0);
  return String(v).trim()!=='';
}
function testCond(c,a){
  const v=a[c.q];
  if('answered' in c) return truthy(v)===c.answered;
  if('eq'  in c) return v===c.eq;
  if('in'  in c) return c.in.includes(v);
  if('has' in c) return Array.isArray(v)&&v.includes(c.has);
  if('hasAny' in c) return Array.isArray(v)&&c.hasAny.some(x=>v.includes(x));
  if('gt'  in c) return Number(v||0)>c.gt;
  return false;
}
function visible(q,a){
  if(!q.showIf) return true;
  const {all,any}=q.showIf;
  if(all&&!all.every(c=>testCond(c,a))) return false;
  if(any&&!any.some(c=>testCond(c,a))) return false;
  return true;
}
const isInput = q => q.type!=='notice';
/* --- end verbatim --- */

const shown = a => FLOW.questions.filter(q => isInput(q) && visible(q,a)).map(q=>q.id);
/* mirrors liveSections() — the pagination spine */
const steps = a => FLOW.sections
  .filter(s => FLOW.questions.some(q => q.section===s.id && visible(q,a)))
  .map(s=>s.label);

const cases = {

  /* Kammui — brand curator, fixed 2N/3D outline to cost, four adults,
     wants land operation including accommodation. */
  KAMMUI: {
    answers: {
      party_type:"b2b_agent", b_org_name:"Kammui", b_contact_name:"Max Mackee",
      b_contact_email:"max@kammui.com", b_phone:"+81", b_country:"Japan",
      b_website:"https://kammui.com",
      b_need:["estimate"], b_maturity:"fixed_itinerary",
      b_brief_paste:"Stop 3 — Takamatsu, Seto Inland Sea & Iya Valley, 2 nights / 3 days...",
      b_date_from:"2026-10-01", b_date_to:"2026-10-03",
      b_group_composition:"4 adults", b_nationality:"Mixed",
      b_group_category:"friends",
      b_arrival_airport:"Takamatsu", b_departure_airport:"Takamatsu",
      b_services:["itinerary","accommodation","car","activities"],
      b_themes:["scenic","local","private"],
      b_rooms:{double:2}, b_room_type:"japanese_ok", b_hotel_category:"luxury",
      b_diet:"None", b_source:"referral"
    },
    mustSee: ["b_brief_paste","b_rooms","b_room_type","b_hotel_category","b_diet","b_themes"],
    mustNotSee: ["b_guide_language","b_group_category_other","b_themes_other","trip_type","md_regions"]
  },

  /* Shailer Park State School — prior itinerary to improve, students,
     no accommodation selected so the whole stay section stays hidden. */
  SHAILER: {
    answers: {
      party_type:"b2b_group", b_org_name:"Shailer Park State School",
      b_contact_name:"Tom Harrison", b_contact_email:"twhar0@eq.edu.au",
      b_phone:"+61", b_country:"Australia", b_website:"https://shailerparkss.eq.edu.au",
      b_need:["full_proposal"], b_maturity:"prior_itinerary",
      b_brief_paste:"2025: 4 nights Tokyo, 2 Kyoto, 1 Hiroshima.",
      b_date_from:"2027-09-23", b_date_to:"2027-10-01",
      b_group_composition:"15 students, 3 teachers, 2-4 chaperones",
      b_nationality:"Australian", b_group_category:"school",
      b_arrival_airport:"Tokyo", b_departure_airport:"Tokyo",
      b_services:["itinerary","guide","transport"],
      b_themes:["history","local"], b_guide_language:"english",
      b_source:"search"
    },
    mustSee: ["b_brief_paste","b_group_category","b_guide_language","b_themes"],
    mustNotSee: ["b_rooms","b_room_type","b_hotel_category","b_diet","b_group_category_other","trip_type"]
  },

  /* ABSA — concept and a date two years out, sports team, wants a partner
     and a site visit. No itinerary to paste, no accommodation yet. */
  ABSA: {
    answers: {
      party_type:"b2b_agent", b_org_name:"American Based Sports Abroad",
      b_contact_name:"Casey Flanagan", b_contact_email:"casey@theabsa.com",
      b_phone:"+1", b_country:"United States", b_website:"https://theabsa.com",
      b_need:["local_partner","site_inspection"], b_maturity:"concept_dates",
      b_date_from:"2028-07-01", b_date_to:"2028-07-14",
      b_group_composition:"30-50, youth teams plus families",
      b_nationality:"American", b_group_category:"sports",
      b_arrival_airport:"Kansai", b_departure_airport:"Kansai",
      b_services:["itinerary","car","activities"],
      b_themes:["sake_food","history"], b_source:"referral"
    },
    mustSee: ["b_group_category","b_need","b_maturity","b_arrival_airport"],
    mustNotSee: ["b_brief_paste","b_rooms","b_diet","b_guide_language","trip_type"]
  }
};

const B2C = { party_type:"b2c_self", trip_type:"multi_day", md_themes:["other"], md_regions:["other"] };

let fail=0;
console.log('flow version', FLOW.version, '·', FLOW.questions.length, 'questions defined\n');

for (const [name,c] of Object.entries(cases)) {
  const vis=shown(c.answers);
  const st=steps(c.answers);
  const missing=c.mustSee.filter(id=>!vis.includes(id));
  const leaked =c.mustNotSee.filter(id=>vis.includes(id));
  const ok=!missing.length&&!leaked.length;
  if(!ok) fail++;
  console.log(`${ok?'PASS':'FAIL'}  ${name.padEnd(8)} ${String(vis.length).padStart(2)} questions across ${st.length} steps`);
  console.log(`        steps: ${st.join(' > ')}`);
  if(missing.length) console.log(`        MISSING: ${missing.join(', ')}`);
  if(leaked.length)  console.log(`        LEAKED : ${leaked.join(', ')}`);
}

/* B2C must never see a B2B question, and its Other fields must work */
const c=shown(B2C), cSteps=steps(B2C);
const leak=c.filter(id=>id.startsWith('b_'));
const others=['md_regions_other','md_themes_other','contact_phone'].filter(id=>!c.includes(id));
if(leak.length||others.length){ fail++;
  console.log(`FAIL  B2C      leaked ${leak.join(', ')||'-'} | missing ${others.join(', ')||'-'}`);
} else {
  console.log(`PASS  B2C      ${c.length} questions across ${cSteps.length} steps, no B2B leakage`);
  console.log(`        steps: ${cSteps.join(' > ')}`);
}

/* No path should exceed the agreed ceiling, and no step should be a wall */
const paths={...cases, B2C:{answers:B2C}};
for(const [n,p] of Object.entries(paths)){
  const a=p.answers;
  const per=FLOW.sections
    .map(s=>FLOW.questions.filter(q=>q.section===s.id&&isInput(q)&&visible(q,a)).length)
    .filter(x=>x);
  const worst=Math.max(...per);
  if(worst>10){ fail++; console.log(`FAIL  ${n}: a step shows ${worst} questions (max 10)`); }
}
if(!fail) console.log('\nPASS  no step shows more than 10 questions');

/* every B2B question reachable by at least one fixture */
const all=new Set(Object.values(cases).flatMap(x=>shown(x.answers)));
const unreachable=FLOW.questions.filter(q=>isInput(q)&&q.id.startsWith('b_')&&!all.has(q.id)).map(q=>q.id);
console.log(unreachable.length
  ? `NOTE  not exercised by these three: ${unreachable.join(', ')}`
  : 'PASS  every B2B question reachable');

process.exit(fail?1:0);
