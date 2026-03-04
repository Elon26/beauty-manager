import UserSex from './user-sex';

type UserProfile = {
  name: string;
  sex: UserSex | null;
  age: number;
  height: number;
  heightMeasure: 'cm' | 'ft';
  weight: number;
  weightMeasure: 'kg' | 'lbs';
};

export default UserProfile;
