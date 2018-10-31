import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { ILocation } from 'app/shared/model/location.model';
import { Principal } from 'app/core';
import { LocationService } from './location.service';

@Component({
    selector: 'jhi-location',
    templateUrl: './location.component.html'
})
export class LocationComponent implements OnInit, OnDestroy {
    locations: ILocation[];
    currentAccount: any;
    eventSubscriber: Subscription;
    currentSearch: string;

    constructor(
        private locationService: LocationService,
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
            this.locationService
                .search({
                    query: this.currentSearch
                })
                .subscribe(
                    (res: HttpResponse<ILocation[]>) => (this.locations = res.body),
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
            return;
        }
        this.locationService.query().subscribe(
            (res: HttpResponse<ILocation[]>) => {
                this.locations = res.body;
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
        this.registerChangeInLocations();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: ILocation) {
        return item.id;
    }

    registerChangeInLocations() {
        this.eventSubscriber = this.eventManager.subscribe('locationListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
