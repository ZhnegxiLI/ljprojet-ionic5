import { TestBed } from '@angular/core/testing';

import { JpushService } from './jpush.service';

describe('JpushService', () => {
  let service: JpushService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JpushService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
