import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SalsOrderPage } from './sals-order.page';

describe('SalsOrderPage', () => {
  let component: SalsOrderPage;
  let fixture: ComponentFixture<SalsOrderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalsOrderPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SalsOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
