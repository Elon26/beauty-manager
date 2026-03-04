import UserPlanType from './user-plan-type';

type UserPlan = {
  name: string;
  type: UserPlanType;
  fastingTime: number;
  eatingTime: number;
  quantityOfStars: number;
};

export default UserPlan;
