import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IDepartment } from 'app/shared/model/department.model';
import { Principal } from 'app/core';
import { DepartmentService } from './department.service';

@Component({
    selector: 'jhi-department',
    templateUrl: './department.component.html'
})
export class DepartmentComponent implements OnInit, OnDestroy {
    departments: IDepartment[];
    currentAccount: any;
    eventSubscriber: Subscription;
    currentSearch: string;

    constructor(
        private departmentService: DepartmentService,
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
            this.departmentService
                .search({
                    query: this.currentSearch
                })
                .subscribe(
                    (res: HttpResponse<IDepartment[]>) => (this.departments = res.body),
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
            return;
        }
        this.departmentService.query().subscribe(
            (res: HttpResponse<IDepartment[]>) => {
                this.departments = res.body;
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
        this.registerChangeInDepartments();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IDepartment) {
        return item.id;
    }

    registerChangeInDepartments() {
        this.eventSubscriber = this.eventManager.subscribe('departmentListModification', response => this.loadAll());
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
