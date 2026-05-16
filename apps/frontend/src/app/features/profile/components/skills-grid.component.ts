import { Component, Input } from '@angular/core';
import type { UserSkill } from '@anime-gamify/shared-types';

@Component({
  selector: 'ag-skills-grid',
  standalone: true,
  template: `
    <section class="ag-skills">
      <h2>Skills</h2>
      <div class="ag-skills__grid">
        @for (us of skills; track us.skill.id) {
          <div class="ag-skill" [class.ag-skill--locked]="!us.unlocked">
            <h3>{{ us.skill.name }}</h3>
            <p>{{ us.skill.description }}</p>
            @if (us.unlocked) {
              <span class="ag-skill__badge ag-skill__badge--unlocked">Unlocked</span>
            } @else {
              <span class="ag-skill__badge">Lv {{ us.skill.requiredLevel }} required</span>
            }
          </div>
        }
        @if (skills.length === 0) {
          <p class="ag-skills__empty">No skills yet.</p>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .ag-skills {
        background: #1a1a1a;
        padding: 1.2rem;
        border-radius: 8px;
      }
      h2 {
        margin: 0 0 0.75rem;
      }
      .ag-skills__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 0.75rem;
      }
      .ag-skill {
        background: #222;
        border: 2px solid #ffb300;
        padding: 0.75rem;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .ag-skill--locked {
        border-color: #444;
        opacity: 0.6;
      }
      .ag-skill h3 {
        margin: 0;
        font-size: 1rem;
      }
      .ag-skill p {
        margin: 0;
        font-size: 0.85rem;
        color: #bbb;
      }
      .ag-skill__badge {
        align-self: flex-start;
        background: #333;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.75rem;
      }
      .ag-skill__badge--unlocked {
        background: #ffb300;
        color: #111;
        font-weight: 700;
      }
      .ag-skills__empty {
        color: #888;
      }
    `,
  ],
})
export class SkillsGridComponent {
  @Input() skills: UserSkill[] = [];
}
