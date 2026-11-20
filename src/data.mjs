export const company = {
  name: 'Akang Kasep Sdn. Bhd.', registration: '201201001255 (974779-V)',
  phone: '09-6227587', phoneHref: '+6096227587', email: 'akangkasep.aksb@gmail.com',
  address: 'No. 3A, Tingkat 1, Bangunan Residensi Kodika, Lot 1298, Kampung Pulau Rusa, 20050 Kuala Terengganu, Terengganu',
  director: 'Muhamad Firdaus Bin Mohammad', founded: '2012-01-11',
};
export const photos = {
  1:[1080,608,'Aerial view of the education-facility buildings with scaffolding'],
  2:[1080,607,'Roof installation and exterior scaffolding viewed from above'],
  3:[1080,608,'Rear aerial view of the roofed buildings during construction'],
  4:[1080,608,'Overhead view of the campus buildings, access roads and parking'],
  5:[1080,608,'Aerial view of the education-facility buildings and external areas'],
  6:[1080,810,'Classroom interior with desks, windows and ceiling fans'],
  7:[1080,810,'Building facade and stair enclosure viewed from the parking area'],
  8:[1080,608,'Building envelope with scaffolding and red roofing'],
  9:[1080,608,'Wide aerial view of the ongoing education-facility project'],
  10:[1080,810,'Corner view of the building, stairway and access areas'],
  11:[1080,810,'Building frontage, parking bays and pedestrian crossing'],
  12:[1080,810,'Concrete structural frame viewed from above before roofing'],
  13:[780,1040,'Site worker carrying out formwork activities'],
  14:[810,1080,'Excavated foundations with reinforcement and formwork'],
  15:[1080,810,'Brickwork and concrete frame of an ancillary building'],
  16:[810,1080,'Site worker inspecting foundation formwork'],
  17:[810,1080,'Crane beside the structural frame and scaffolded building'],
  18:[1080,810,'Crane and upper-floor concrete structure under construction'],
};
export const services = [
 {id:'building-construction',title:'Building Construction',short:'Construction',photo:18,text:'Discuss building works, coordination and the requirements of your project.',points:['Building works','Site coordination','Progress review'],cta:'Discuss construction'},
 {id:'civil-external-works',title:'Civil & External Works',short:'Civil Works',photo:11,text:'External works considered as part of the agreed project scope.',points:['Site interfaces','External areas','Work coordination'],cta:'Discuss external works'},
 {id:'maintenance-refurbishment',title:'Maintenance & Refurbishment',short:'Maintenance',photo:7,text:'Talk to us about the maintenance or refurbishment needs of your building.',points:['Maintenance brief','Repair requirements','Agreed work scope'],cta:'Discuss maintenance'},
 {id:'mechanical-electrical',title:'Selected M&E Works',short:'M&E',photo:6,text:'Discuss selected mechanical and electrical requirements within the agreed scope.',points:['Service requirements','Installation scope','Coordination'],cta:'Discuss M&E'}
];
export const history = [
 {id:'putrajaya-quarters',title:'Putrajaya quarters maintenance',description:'Maintenance and related works at Quarters 18R12 & 18R13, Precinct 18, Putrajaya, over a three-year contract.',client:'Perbadanan Putrajaya',value:'RM13,589,400',date:'June 2022',scope:'Maintenance and related works'},
 {id:'paralympic-kitchen-systems',title:'Paralympic sports centre kitchen systems',description:'Supply, delivery and installation of kitchen equipment, kitchen hoods, fume extraction and LPG systems at Kompleks Sukan Kg. Pandan, Kuala Lumpur.',client:'SPA Integrated Sdn. Bhd.',value:'RM279,020',date:'August 2012',scope:'Kitchen, ventilation and LPG systems'}
];
export const credentials = [
 {id:'cidb',title:'CIDB Registration',subtitle:'Grade G7',text:'Building · Civil Engineering · Mechanical & Electrical',reference:'0120200610-WP047646',from:'10 November 2025',until:'25 August 2028',details:'The supplied CIDB registration lists Grade G7 in categories B, CE and ME.'},
 {id:'spkk',title:'Government Procurement',subtitle:'SPKK',text:'View the relevant registration document',reference:'0120200610-WP047646',from:'10 November 2025',until:'25 August 2028',details:'The supplied Sijil Perolehan Kerja Kerajaan records G7 registration in categories B, CE and ME.'},
 {id:'stb',title:'Bumiputera Status',subtitle:'STB',text:'Company status documentation',reference:'0120200610-WP047646',from:'10 September 2025',until:'25 August 2028',details:'The supplied Sijil Taraf Bumiputera records Bumiputera contractor status.'},
 {id:'mof',title:'Ministry of Finance',subtitle:'MOF Registration',text:'Registration and approved fields',reference:'357-0002346080',from:'6 November 2025',until:'5 November 2028',details:'The company profile includes Ministry of Finance supplier registration and its listed fields. Discuss the applicable field for your enquiry with our team.'},
 {id:'score',title:'CIDB SCORE',subtitle:'3 Star — 2025 assessment',text:'Assessment record in the company profile',reference:'2025 assessment',from:'9 May 2025',until:'8 May 2027',details:'The supplied certificate records a 3 Star rating under the CIDB SCORE scheme for 2025. This is a contractor assessment, not a customer-review rating.'},
];
export const navigation = [['Home','/'],['About','/about'],['Services','/services'],['Projects','/projects'],['Credentials','/credentials'],['Contact','/contact']];
export const routes = [
 {path:'/',key:'home',title:'Construction & Maintenance in Kuala Terengganu | Akang Kasep',description:'Akang Kasep Sdn. Bhd. is a Kuala Terengganu construction and maintenance company. Explore our services, project experience and company credentials.'},
 {path:'/about',key:'about',title:'About Akang Kasep | Construction Company in Terengganu',description:'Meet Akang Kasep Sdn. Bhd., a Bumiputera-owned company incorporated in Terengganu in 2012. Discover our people, strengths and company information.'},
 {path:'/services',key:'services',title:'Construction & Building Maintenance Services | Akang Kasep',description:'Discuss building construction, civil and external works, building maintenance, refurbishment and selected mechanical and electrical requirements with Akang Kasep.'},
 {path:'/projects',key:'projects',title:'Construction & Maintenance Project Experience | Akang Kasep',description:'Explore ongoing site photography and recorded experience in Putrajaya quarters maintenance and specialist kitchen, ventilation and LPG installations.'},
 {path:'/projects/education-facility',key:'project',title:'Education Facility Project Progress | Akang Kasep',description:'View construction stages and site photographs for our ongoing education-facility project. Project name is a working title.',noindex:true},
 {path:'/project-progress',key:'progress',title:'Before & After: Construction Progress | Akang Kasep',description:'Explore earlier structural work, building-envelope progress and later site views through an accessible photographic construction story.',noindex:true},
 {path:'/credentials',key:'credentials',title:'CIDB G7, SPKK, STB & MOF Credentials | Akang Kasep',description:'Review company-profile records for Akang Kasep: CIDB G7 categories B, CE and ME, SPKK, Bumiputera status, MOF registration and CIDB SCORE.'},
 {path:'/contact',key:'contact',title:'Contact Akang Kasep | Kuala Terengganu Contractor',description:'Discuss a construction or building-maintenance project with Akang Kasep in Kuala Terengganu. Call 09-6227587 or send a project enquiry.'},
 {path:'/privacy',key:'privacy',title:'Privacy Notice | Akang Kasep',description:'How project enquiries and personal information are handled through the Akang Kasep website.'},
 {path:'/thank-you',key:'thanks',title:'Enquiry Confirmation | Akang Kasep',description:'Your project enquiry status.',noindex:true},
 {path:'/404',key:'notfound',title:'Page Not Found | Akang Kasep',description:'Return to the Akang Kasep website.',noindex:true},
];
