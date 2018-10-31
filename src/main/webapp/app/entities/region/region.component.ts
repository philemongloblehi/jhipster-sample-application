import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IRegion } from 'app/shared/model/region.model';
import { Principal } from 'app/core';
import { RegionService } from './region.service';

@Component({
    selector: 'jhi-region',
    templateUrl: './region.component.html'
})
export class RegionComponent implements OnInit, OnDestroy {
    regions: IRegion[];
    currentAccount: any;
    eventSubscriber: Subscription;
    currentSearch: string;

    constructor(
        private regionService: RegionService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private activatedRoute: ActivatedRoute,
        private principal: Principal
    ) {
        this.currentSearch =
            this.activatedRoute.snapshot && this.activatedRoute.snapshot.params['search']
                ? this.activatedRoute.snapshot.params['search']
                : '';
    }

    loadAll() {
        if (this.currentSearch) {
            this.regionService
                .search({
                    query: this.currentSearch
                })
                .subscribe(
                    (res: HttpResponse<IRegion[]>) => (this.regions = res.body),
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
            return;
        }
        this.regionService.query().subscribe(
            (res: HttpResponse<IRegion[]>) => {
                this.regions = res.body;
                this.currentSearch = '';
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    search(query) {
        if (!query) {
            return this.clear();
        }
        this.currentSearch = query;
        this.loadAll();
    }

    clear() {
        this.currentSearch = '';
        this.loadAll();
    }

    ngOnInit() {
        this.loadAll();
        this.principal.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInRegions();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IRegion) {
        return item.id;
    }

    registerChangeInRegions() {
        this.eventSubscriber = this.eventManager.subscribe('regionListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
