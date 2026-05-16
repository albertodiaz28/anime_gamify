import { Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AvatarConfig, UserProgress, UserSkill } from '@anime-gamify/shared-types';
import { UserApi } from '../../core/services/user.api';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton.component';
import { StatsCardComponent } from './components/stats-card.component';
import { SkillsGridComponent } from './components/skills-grid.component';
import { AvatarEditorComponent } from './components/avatar-editor.component';

@Component({
  selector: 'ag-profile-page',
  standalone: true,
  imports: [
    LoadingSkeletonComponent,
    StatsCardComponent,
    SkillsGridComponent,
    AvatarEditorComponent,
  ],
  template: `
    <section class="ag-profile">
      <h1>Profile</h1>

      @if (loading()) {
        <ag-loading-skeleton height="120px" />
        <ag-loading-skeleton height="200px" />
      } @else {
        @if (progress(); as p) {
          <ag-stats-card [progress]="p" />
        }
        <ag-skills-grid [skills]="skills()" />
        @if (avatarConfig(); as cfg) {
          <ag-avatar-editor
            [avatarConfig]="cfg"
            [unlockedSkills]="skills()"
            [saving]="savingAvatar()"
            (save)="onSaveAvatar($event)"
          />
        }
      }
    </section>
  `,
  styles: [
    `
      .ag-profile {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 900px;
        margin: 0 auto;
      }
      h1 {
        margin: 0;
      }
    `,
  ],
})
export class ProfilePageComponent implements OnInit {
  private readonly userApi = inject(UserApi);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly progress = signal<UserProgress | null>(null);
  readonly skills = signal<UserSkill[]>([]);
  readonly avatarConfig = signal<AvatarConfig | null>(null);
  readonly loading = signal<boolean>(true);
  readonly savingAvatar = signal<boolean>(false);

  ngOnInit(): void {
    void this.load();
  }

  async onSaveAvatar(config: AvatarConfig): Promise<void> {
    this.savingAvatar.set(true);
    try {
      const updated = await firstValueFrom(this.userApi.updateAvatar(config));
      this.authService.setCurrentUser(updated);
      this.avatarConfig.set(updated.avatarConfig);
      this.toast.success('Avatar saved.');
    } catch {
      this.toast.error('Failed to save avatar.');
    } finally {
      this.savingAvatar.set(false);
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [progress, skills, me] = await Promise.all([
        firstValueFrom(this.userApi.getProgress()),
        firstValueFrom(this.userApi.getSkills()),
        firstValueFrom(this.userApi.getMe()),
      ]);
      this.progress.set(progress);
      this.skills.set(skills);
      this.avatarConfig.set(me.avatarConfig);
      this.authService.setCurrentUser(me);
    } catch {
      this.toast.error('Failed to load profile.');
    } finally {
      this.loading.set(false);
    }
  }
}
