export const USER_LEVELED_UP_EVENT = 'user.leveled-up';

export class UserLeveledUpEvent {
  constructor(
    public readonly userId: string,
    public readonly oldLevel: number,
    public readonly newLevel: number,
  ) {}
}
