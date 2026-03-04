import UserPlan from '@/types/user-plan';

const userPlans: UserPlan[] = [
  {
    name: '12:12',
    type: 'begin',
    fastingTime: 12,
    eatingTime: 12,
    quantityOfStars: 1,
  },
  {
    name: '13:11',
    type: 'begin',
    fastingTime: 13,
    eatingTime: 11,
    quantityOfStars: 2,
  },
  {
    name: '14:10',
    type: 'begin',
    fastingTime: 14,
    eatingTime: 10,
    quantityOfStars: 3,
  },
  {
    name: '16:8',
    type: 'advanced',
    fastingTime: 16,
    eatingTime: 8,
    quantityOfStars: 1,
  },
  {
    name: '17:7',
    type: 'advanced',
    fastingTime: 17,
    eatingTime: 7,
    quantityOfStars: 2,
  },
  {
    name: '18:6',
    type: 'advanced',
    fastingTime: 18,
    eatingTime: 6,
    quantityOfStars: 3,
  },
  {
    name: '20:4',
    type: 'pro',
    fastingTime: 20,
    eatingTime: 4,
    quantityOfStars: 1,
  },
  {
    name: '21:3',
    type: 'pro',
    fastingTime: 21,
    eatingTime: 3,
    quantityOfStars: 2,
  },
  {
    name: '22:2',
    type: 'pro',
    fastingTime: 22,
    eatingTime: 2,
    quantityOfStars: 3,
  },
];

export default userPlans;
