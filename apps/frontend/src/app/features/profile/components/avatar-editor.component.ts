import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import type { AvatarConfig, UserSkill } from '@anime-gamify/shared-types';
import { SkillType } from '@anime-gamify/shared-types';

type Slot = 'hair' | 'eyes' | 'outfit' | 'background' | 'accessory';

interface CosmeticOption {
  id: string;
  name: string;
  asset: string;
  slot: Slot;
}

type SingleSlot = Exclude<Slot, 'accessory'>;
const SINGLE_SLOTS: SingleSlot[] = ['hair', 'eyes', 'outfit', 'background'];

@Component({
  selector: 'ag-avatar-editor',
  standalone: true,
  template: `
    <section class="ag-avatar">
      <h2>Avatar</h2>
      <div class="ag-avatar__layout">
        <div class="ag-avatar__preview" aria-label="Avatar preview">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" [attr.fill]="bgColor()" />
            <circle cx="100" cy="100" r="60" fill="#f4d4b8" />
            @if (draft().eyes) {
              <text x="100" y="100" text-anchor="middle" font-size="14" fill="#222">{{ draft().eyes }}</text>
            }
            @if (draft().hair) {
              <text x="100" y="60" text-anchor="middle" font-size="12" fill="#222">{{ draft().hair }}</text>
            }
            @if (draft().outfit) {
              <rect x="60" y="140" width="80" height="50" [attr.fill]="outfitColor()" />
            }
          </svg>
        </div>

        <div class="ag-avatar__slots">
          @for (slot of singleSlots; track slot) {
            <div class="ag-avatar__slot">
              <h4>{{ slot }}</h4>
              <div class="ag-avatar__options">
                <button
                  type="button"
                  class="ag-avatar__opt"
                  [class.ag-avatar__opt--active]="!getSlotValue(slot)"
                  (click)="clearSlot(slot)"
                >None</button>
                @for (opt of optionsForSlot(slot); track opt.id) {
                  <button
                    type="button"
                    class="ag-avatar__opt"
                    [class.ag-avatar__opt--active]="getSlotValue(slot) === opt.asset"
                    (click)="setSlot(slot, opt.asset)"
                  >{{ opt.name }}</button>
                }
              </div>
            </div>
          }

          <div class="ag-avatar__slot">
            <h4>Accessories</h4>
            <div class="ag-avatar__options">
              @for (opt of optionsForSlot('accessory'); track opt.id) {
                <button
                  type="button"
                  class="ag-avatar__opt"
                  [class.ag-avatar__opt--active]="hasAccessory(opt.asset)"
                  (click)="toggleAccessory(opt.asset)"
                >{{ opt.name }}</button>
              }
            </div>
          </div>

          <button
            type="button"
            class="ag-avatar__save"
            (click)="save.emit(draft())"
            [disabled]="saving"
          >{{ saving ? 'Saving...' : 'Save Avatar' }}</button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .ag-avatar {
        background: #1a1a1a;
        padding: 1.2rem;
        border-radius: 8px;
      }
      h2 {
        margin: 0 0 0.75rem;
      }
      .ag-avatar__layout {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 1rem;
      }
      .ag-avatar__preview {
        background: #222;
        border-radius: 8px;
        overflow: hidden;
      }
      .ag-avatar__preview svg {
        width: 100%;
        height: auto;
        display: block;
      }
      .ag-avatar__slots {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .ag-avatar__slot h4 {
        margin: 0 0 0.3rem;
        text-transform: capitalize;
        font-size: 0.85rem;
        color: #aaa;
      }
      .ag-avatar__options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .ag-avatar__opt {
        background: #222;
        color: #fff;
        border: 1px solid #333;
        padding: 0.25rem 0.7rem;
        border-radius: 999px;
        font-size: 0.8rem;
        cursor: pointer;
      }
      .ag-avatar__opt--active {
        background: #1976d2;
        border-color: #1976d2;
      }
      .ag-avatar__save {
        align-self: flex-start;
        margin-top: 0.5rem;
        background: #2e7d32;
        color: #fff;
        border: 0;
        padding: 0.5rem 1.2rem;
        border-radius: 6px;
        cursor: pointer;
      }
      .ag-avatar__save[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      @media (max-width: 600px) {
        .ag-avatar__layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AvatarEditorComponent implements OnChanges {
  @Input({ required: true }) avatarConfig!: AvatarConfig;
  @Input() unlockedSkills: UserSkill[] = [];
  @Input() saving = false;
  @Output() save = new EventEmitter<AvatarConfig>();

  readonly singleSlots = SINGLE_SLOTS;
  readonly draft = signal<AvatarConfig>({ baseSkin: 'default' });

  readonly cosmetics = computed<CosmeticOption[]>(() =>
    this.unlockedSkills
      .filter(
        (us) =>
          us.unlocked &&
          us.skill.type === SkillType.COSMETIC &&
          us.skill.payload.asset &&
          us.skill.payload.slot,
      )
      .map((us) => ({
        id: us.skill.id,
        name: us.skill.name,
        asset: us.skill.payload.asset as string,
        slot: us.skill.payload.slot as Slot,
      })),
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['avatarConfig'] && this.avatarConfig) {
      this.draft.set({ ...this.avatarConfig, accessories: [...(this.avatarConfig.accessories ?? [])] });
    }
  }

  bgColor(): string {
    return this.draft().background ?? '#2a2a2a';
  }

  outfitColor(): string {
    return this.draft().outfit ? '#1976d2' : '#666';
  }

  optionsForSlot(slot: Slot): CosmeticOption[] {
    return this.cosmetics().filter((c) => c.slot === slot);
  }

  getSlotValue(slot: Exclude<Slot, 'accessory'>): string | undefined {
    return this.draft()[slot];
  }

  setSlot(slot: Exclude<Slot, 'accessory'>, value: string): void {
    this.draft.update((d) => ({ ...d, [slot]: value }));
  }

  clearSlot(slot: Exclude<Slot, 'accessory'>): void {
    this.draft.update((d) => {
      const next = { ...d };
      delete next[slot];
      return next;
    });
  }

  hasAccessory(asset: string): boolean {
    return (this.draft().accessories ?? []).includes(asset);
  }

  toggleAccessory(asset: string): void {
    this.draft.update((d) => {
      const current = d.accessories ?? [];
      const next = current.includes(asset)
        ? current.filter((a) => a !== asset)
        : [...current, asset];
      return { ...d, accessories: next };
    });
  }
}
