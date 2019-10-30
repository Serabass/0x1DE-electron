import { TestBed } from '@angular/core/testing';

import { DcpuService } from './dcpu.service';

describe('DcpuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DcpuService = TestBed.get(DcpuService);
    expect(service).toBeTruthy();
  });
});
