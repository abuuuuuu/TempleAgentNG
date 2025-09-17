import { TestBed } from '@angular/core/testing';

import { KodiService } from './kodi.service';

describe('KodiService', () => {
  let service: KodiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KodiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
