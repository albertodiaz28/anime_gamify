import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('adds and dismisses toasts', () => {
    service.success('hello');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].kind).toBe('success');
    service.dismiss(service.toasts()[0].id);
    expect(service.toasts().length).toBe(0);
  });

  it('formats xp toast', () => {
    service.xp(50);
    expect(service.toasts()[0].message).toBe('+50 XP');
    expect(service.toasts()[0].kind).toBe('xp');
  });
});
