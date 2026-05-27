export const doctorSpecialties = [
  { icon: '/images/icon/mental-health.png', title: 'মনোরোগ বিশেষজ্ঞ' },
  { icon: '/images/icon/heart-rate.png', title: 'হৃদরোগ বিশেষজ্ঞ' },
  { icon: '/images/icon/doctorpilies.png', title: 'পাইলস বিশেষজ্ঞ' },
  { icon: '/images/icon/dentist.png', title: 'ডেন্টিস্ট' },
  { icon: '/images/icon/healthy.png', title: 'চর্ম রোগ বিশেষজ্ঞ' },
  { icon: '/images/icon/doctor-dibities.png', title: 'ডায়াবেটিস বিশেষজ্ঞ' },
  { icon: '/images/icon/medical.png', title: 'নাক, কান ও গলা' },
  { icon: '/images/icon/optometrist.png', title: 'চক্ষু বিশেষজ্ঞ' },
  { icon: '/images/icon/hepatologist.png', title: 'লিভার বিশেষজ্ঞ' },
  { icon: '/images/icon/urology.png', title: 'ইউরোলজি' },
  { icon: '/images/icon/surgeon.png', title: 'সার্জারি' },
  { icon: '/images/icon/maternity-care.png', title: 'গাইনী বিশেষজ্ঞ' },
  { icon: '/images/icon/doctorblood.png', title: 'রক্তরোগ বিশেষজ্ঞ' },
  { icon: '/images/icon/drugs.png', title: 'মেডিসিন' },
  { icon: '/images/icon/kidney.png', title: 'কিডনি রোগ বিশেষজ্ঞ' },
  { icon: '/images/icon/002-doctor.png', title: 'শিশু রোগ বিশেষজ্ঞ' },
  { icon: '/images/icon/nutrition-plan.png', title: 'পুষ্টি বিশেষজ্ঞ' },
];

export const services = [
  { slug: 'doctors', title: 'ডাক্তার', collection: 'doctors', icon: '/images/icon/doctor.png', addText: 'ডাক্তারের তথ্য যোগ করুন', fields: [
    ['name','ডাক্তারের নাম','text',true],
    ['category','কোন রোগের বিশেষজ্ঞ','select',true, doctorSpecialties.map((item) => item.title)],
    ['specialty','বিশেষত্ব','text',false],
    ['number','ফোন নাম্বার','tel',true],
    ['education','ডাক্তারের শিক্ষাগত যোগ্যতা','text',false],
    ['chamber','ডাক্তারের বর্তমান কর্মস্থল','text',false],
    ['details','যেই যেই রোগের চিকিৎসা করেন','textarea',false],
    ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'hospitals', title: 'হাসপাতাল', collection: 'hospitals', icon: '/images/icon/hospital.png', addText: 'হাসপাতালের তথ্য যোগ করুন', fields: [
    ['name','হাসপাতালের নাম','text',true], ['phone','মোবাইল/হেল্পলাইন','tel',true], ['address','ঠিকানা','text',true], ['service_type','সেবার ধরন','text',false], ['office_time','সেবা সময়','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'bus', title: 'বাসের সময়সূচি', collection: 'busschedule', icon: '/images/icon/bus.png', addText: 'বাসের সময়সূচি যোগ করুন', fields: [
    ['name','বাস/কোম্পানির নাম','text',true], ['route','রুট','text',true], ['time','সময়','text',true], ['phone','যোগাযোগ নাম্বার','tel',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'places', title: 'দর্শনীয় স্থান', collection: 'historical_place', icon: '/images/icon/sightseeing.png', addText: 'দর্শনীয় স্থান যোগ করুন', fields: [
    ['name','স্থানের নাম','text',true], ['address','ঠিকানা','text',true], ['details','বিস্তারিত','textarea',true], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'house-rent', title: 'বাসা ভাড়া', collection: 'house_rent', icon: '/images/icon/house.png', addText: 'বাসা ভাড়ার তথ্য যোগ করুন', fields: [
    ['name','শিরোনাম/বাসার নাম','text',true], ['owner_name','মালিক/যোগাযোগকারী','text',false], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['rent_price','ভাড়া','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'shopping', title: 'শপিং', collection: 'shopping_services', icon: '/images/icon/online-shopping.png', addText: 'নতুন দোকান যোগ করুন', fields: [
    ['name','দোকান/শপের নাম','text',true], ['owner_name','মালিক/যোগাযোগকারী','text',false], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['service_type','পণ্য/সেবার ধরন','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'fire-service', title: 'ফায়ার সার্ভিস', collection: 'fireservice', icon: '/images/icon/firetruck.png', addText: 'ফায়ার সার্ভিস তথ্য যোগ করুন', fields: [
    ['name','সেবার নাম','text',true], ['phone','জরুরি নাম্বার','tel',true], ['address','ঠিকানা','text',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'courier', title: 'কুরিয়ার সার্ভিস', collection: 'courier_service', icon: '/images/icon/delivery.png', addText: 'কুরিয়ার সার্ভিস যোগ করুন', fields: [
    ['name','কুরিয়ার নাম','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['office_time','অফিস সময়','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'police', title: 'থানা-পুলিশ', collection: 'police_services', icon: '/images/icon/policeman.png', addText: 'পুলিশ তথ্য যোগ করুন', fields: [
    ['name','নাম/অফিসের নাম','text',true], ['designation','পদবি/সেবার ধরন','text',false], ['phone','মোবাইল/হেল্পলাইন','tel',true], ['address','ঠিকানা','text',false], ['office_time','সেবা/ডিউটি সময়','text',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'electricity', title: 'বিদ্যুৎ অফিস', collection: 'electricity_offices', icon: '/images/icon/idea.png', addText: 'বিদ্যুৎ অফিস তথ্য যোগ করুন', fields: [
    ['name','অফিস/সেবার নাম','text',true], ['contact_person','যোগাযোগকারী/কর্মকর্তা','text',false], ['phone','মোবাইল/হেল্পলাইন','tel',true], ['address','ঠিকানা','text',true], ['office_time','অফিস সময়','text',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'diagnostic', title: 'ডায়াগনস্টিক', collection: 'diagnostic_centers', icon: '/images/icon/monitoring-system.png', addText: 'ডায়াগনস্টিক যোগ করুন', fields: [
    ['name','সেন্টারের নাম','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['service_type','টেস্ট/সেবার ধরন','text',false], ['office_time','সেবা সময়','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'blood', title: 'রক্ত', collection: 'blood_donors', icon: '/images/icon/blood.png', addText: 'রক্তদাতা যোগ করুন', fields: [
    ['name','রক্তদাতার নাম','text',true], ['blood_group','রক্তের গ্রুপ','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['last_donation','শেষ রক্তদানের তারিখ','text',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'vehicle-rent', title: 'গাড়ি ভাড়া', collection: 'vehicle_rent_services', icon: '/images/icon/vehicle.png', addText: 'গাড়ি ভাড়ার তথ্য যোগ করুন', fields: [
    ['name','গাড়ির ধরন/শিরোনাম','text',true], ['owner_name','মালিক/চালকের নাম','text',false], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['rent_price','ভাড়া/রুট','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'mechanic', title: 'মিস্ত্রি', collection: 'mechanic_services', icon: '/images/icon/mechanic.png', addText: 'মিস্ত্রি যোগ করুন', fields: [
    ['name','মিস্ত্রির নাম','text',true], ['service_type','কাজের ধরন','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['experience','অভিজ্ঞতা/সময়','text',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'emergency', title: 'জরুরী সেবা', collection: 'emergency_services', icon: '/images/icon/customer-service.png', addText: 'জরুরী সেবা যোগ করুন', fields: [
    ['name','সেবার নাম','text',true], ['phone','মোবাইল/হেল্পলাইন','tel',true], ['address','ঠিকানা','text',false], ['service_type','সেবার ধরন','text',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'jobs', title: 'চাকরি', collection: 'jobs', icon: '/images/icon/job.png', addText: 'চাকরির বিজ্ঞাপন যোগ করুন', fields: [
    ['name','প্রতিষ্ঠানের নাম','text',true], ['job_title','পদের নাম','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['salary','বেতন/সময়সীমা','text',false], ['details','বিস্তারিত','textarea',true]
  ]},
  { slug: 'entrepreneurs', title: 'উদ্যোক্তা', collection: 'entrepreneurs', icon: '/images/icon/freelance-work.png', addText: 'উদ্যোক্তার তথ্য যোগ করুন', fields: [
    ['name','উদ্যোক্তা/ব্যবসার নাম','text',true], ['service_type','পণ্য/সেবার ধরন','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['details','বিস্তারিত','textarea',true], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'teachers', title: 'শিক্ষক', collection: 'teachers', icon: '/images/icon/teacher.png', addText: 'শিক্ষক যোগ করুন', fields: [
    ['name','শিক্ষকের নাম','text',true], ['subject','বিষয়','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['experience','অভিজ্ঞতা','text',false], ['details','বিস্তারিত','textarea',false]
  ]},
  { slug: 'parlors', title: 'পার্লার', collection: 'parlors', icon: '/images/icon/makeup-brushes.png', addText: 'পার্লার যোগ করুন', fields: [
    ['name','পার্লারের নাম','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['service_type','সেবার ধরন','text',false], ['office_time','সময়','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'restaurants', title: 'রেস্টুরেন্ট', collection: 'restaurants', icon: '/images/icon/restaurant.png', addText: 'রেস্টুরেন্ট যোগ করুন', fields: [
    ['name','রেস্টুরেন্টের নাম','text',true], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['service_type','খাবার/সেবার ধরন','text',false], ['office_time','খোলা থাকার সময়','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'flat-land', title: 'ফ্লাট ও জমি', collection: 'flat_land', icon: '/images/icon/architect.png', addText: 'ফ্লাট/জমির তথ্য যোগ করুন', fields: [
    ['name','শিরোনাম','text',true], ['owner_name','মালিক/যোগাযোগকারী','text',false], ['phone','মোবাইল নাম্বার','tel',true], ['address','ঠিকানা','text',true], ['price','মূল্য','text',false], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
  { slug: 'schools', title: 'শিক্ষা প্রতিষ্ঠান', collection: 'education_institutions', icon: '/images/icon/school.png', addText: 'শিক্ষা প্রতিষ্ঠান যোগ করুন', fields: [
    ['name','প্রতিষ্ঠানের নাম','text',true], ['type','প্রতিষ্ঠানের ধরন','text',false], ['phone','যোগাযোগ নাম্বার','tel',false], ['address','ঠিকানা','text',true], ['details','বিস্তারিত','textarea',false], ['image','ছবির লিংক','url',false]
  ]},
];

export function getService(slug) {
  return services.find((service) => service.slug === slug);
}

export function isApproved(data) {
  return data?.approved === true || data?.approved === 1 || data?.approve === true || data?.approve === 1 || data?.approval === true || data?.approval === 1 || data?.status === 'approved';
}
