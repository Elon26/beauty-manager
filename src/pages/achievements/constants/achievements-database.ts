import achievement1Fill from '@/images/achievements/achivement-1-fill.png';
import achievement1UnFill from '@/images/achievements/achivement-1-unfill.png';
import achievement2Fill from '@/images/achievements/achivement-2-fill.png';
import achievement2UnFill from '@/images/achievements/achivement-2-unfill.png';
import achievement3Fill from '@/images/achievements/achivement-3-fill.png';
import achievement3UnFill from '@/images/achievements/achivement-3-unfill.png';
import achievement4Fill from '@/images/achievements/achivement-4-fill.png';
import achievement4UnFill from '@/images/achievements/achivement-4-unfill.png';
import achievement5Fill from '@/images/achievements/achivement-5-fill.png';
import achievement5UnFill from '@/images/achievements/achivement-5-unfill.png';
import achievement6Fill from '@/images/achievements/achivement-6-fill.png';
import achievement6UnFill from '@/images/achievements/achivement-6-unfill.png';
import achievement7Fill from '@/images/achievements/achivement-7-fill.png';
import achievement7UnFill from '@/images/achievements/achivement-7-unfill.png';
import achievement8Fill from '@/images/achievements/achivement-8-fill.png';
import achievement8UnFill from '@/images/achievements/achivement-8-unfill.png';
import achievement9Fill from '@/images/achievements/achivement-9-fill.png';
import achievement9UnFill from '@/images/achievements/achivement-9-unfill.png';
import achievement10Fill from '@/images/achievements/achivement-10-fill.png';
import achievement10UnFill from '@/images/achievements/achivement-10-unfill.png';
import achievement11Fill from '@/images/achievements/achivement-11-fill.png';
import achievement11UnFill from '@/images/achievements/achivement-11-unfill.png';
import achievement12Fill from '@/images/achievements/achivement-12-fill.png';
import achievement12UnFill from '@/images/achievements/achivement-12-unfill.png';
import achievement13Fill from '@/images/achievements/achivement-13-fill.png';
import achievement13UnFill from '@/images/achievements/achivement-13-unfill.png';
import achievement14Fill from '@/images/achievements/achivement-14-fill.png';
import achievement14UnFill from '@/images/achievements/achivement-14-unfill.png';
import achievement15Fill from '@/images/achievements/achivement-15-fill.png';
import achievement15UnFill from '@/images/achievements/achivement-15-unfill.png';
import achievement16Fill from '@/images/achievements/achivement-16-fill.png';
import achievement16UnFill from '@/images/achievements/achivement-16-unfill.png';
import AchievementItem from '@/types/achievement-item';

const achievementsDatabase: AchievementItem[] = [
  {
    name: t('pages.achievements.first-step-to-control'),
    days: 1,
    fillIcon: achievement1Fill,
    unfillIcon: achievement1UnFill,
  },
  {
    name: t('pages.achievements.willpower-awakened'),
    days: 3,
    fillIcon: achievement2Fill,
    unfillIcon: achievement2UnFill,
  },
  {
    name: t('pages.achievements.appetite-tamer'),
    days: 5,
    fillIcon: achievement3Fill,
    unfillIcon: achievement3UnFill,
  },
  {
    name: t('pages.achievements.fasting-warrior'),
    days: 7,
    fillIcon: achievement4Fill,
    unfillIcon: achievement4UnFill,
  },
  {
    name: t('pages.achievements.routine-guardian'),
    days: 9,
    fillIcon: achievement5Fill,
    unfillIcon: achievement5UnFill,
  },
  {
    name: t('pages.achievements.intermittent-master'),
    days: 11,
    fillIcon: achievement6Fill,
    unfillIcon: achievement6UnFill,
  },
  {
    name: t('pages.achievements.metabolism-guru'),
    days: 13,
    fillIcon: achievement7Fill,
    unfillIcon: achievement7UnFill,
  },
  {
    name: t('pages.achievements.body-on-autopilot'),
    days: 18,
    fillIcon: achievement8Fill,
    unfillIcon: achievement8UnFill,
  },
  {
    name: t('pages.achievements.fasting-in-control'),
    days: 24,
    fillIcon: achievement9Fill,
    unfillIcon: achievement9UnFill,
  },
  {
    name: t('pages.achievements.iron-discipline'),
    days: 30,
    fillIcon: achievement10Fill,
    unfillIcon: achievement10UnFill,
  },
  {
    name: t('pages.achievements.mindful-eater'),
    days: 36,
    fillIcon: achievement11Fill,
    unfillIcon: achievement11UnFill,
  },
  {
    name: t('pages.achievements.golden-health'),
    days: 42,
    fillIcon: achievement12Fill,
    unfillIcon: achievement12UnFill,
  },
  {
    name: t('pages.achievements.ambassador-of-awareness'),
    days: 50,
    fillIcon: achievement13Fill,
    unfillIcon: achievement13UnFill,
  },
  {
    name: t('pages.achievements.pro-level-ascetic'),
    days: 60,
    fillIcon: achievement14Fill,
    unfillIcon: achievement14UnFill,
  },
  {
    name: t('pages.achievements.habit-master'),
    days: 74,
    fillIcon: achievement15Fill,
    unfillIcon: achievement15UnFill,
  },
  {
    name: t('pages.achievements.life-without-overeating'),
    days: 90,
    fillIcon: achievement16Fill,
    unfillIcon: achievement16UnFill,
  },
];

export default achievementsDatabase;
