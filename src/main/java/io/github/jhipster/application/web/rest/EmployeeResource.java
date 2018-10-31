package io.github.jhipster.application.web.rest;

import com.codahale.metrics.annotation.Timed;
import io.github.jhipster.application.domain.Employee;
import io.github.jhipster.application.repository.EmployeeRepository;
import io.github.jhipster.application.repository.search.EmployeeSearchRepository;
import io.github.jhipster.application.web.rest.errors.BadRequestAlertException;
import io.github.jhipster.application.web.rest.util.HeaderUtil;
import io.github.jhipster.application.web.rest.util.PaginationUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing Employee.
 */
@RestController
@RequestMapping("/api")
public class EmployeeResource {

    private final Logger log = LoggerFactory.getLogger(EmployeeResource.class);

    private static final String ENTITY_NAME = "employee";

    private EmployeeRepository employeeRepository;

    private EmployeeSearchRepository employeeSearchRepository;

    public EmployeeResource(EmployeeRepository employeeRepository, EmployeeSearchRepository employeeSearchRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeSearchRepository = employeeSearchRepository;
    }

    /**
     * POST  /employees : Create a new employee.
     *
     * @param employee the employee to create
     * @return the ResponseEntity with status 201 (Created) and with body the new employee, or with status 400 (Bad Request) if the employee has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/employees")
    @Timed
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) throws URISyntaxException {
        log.debug("REST request to save Employee : {}", employee);
        if (employee.getId() != null) {
            throw new BadRequestAlertException("A new employee cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Employee result = employeeRepository.save(employee);
        employeeSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/employees/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /employees : Updates an existing employee.
     *
     * @param employee the employee to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated employee,
     * or with status 400 (Bad Request) if the employee is not valid,
     * or with status 500 (Internal Server Error) if the employee couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/employees")
    @Timed
    public ResponseEntity<Employee> updateEmployee(@RequestBody Employee employee) throws URISyntaxException {
        log.debug("REST request to update Employee : {}", employee);
        if (employee.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Employee result = employeeRepository.save(employee);
        employeeSearchRepository.save(result);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, employee.getId().toString()))
            .body(result);
    }

    /**
     * GET  /employees : get all the employees.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of employees in body
     */
    @GetMapping("/employees")
    @Timed
    public ResponseEntity<List<Employee>> getAllEmployees(Pageable pageable) {
        log.debug("REST request to get a page of Employees");
        Page<Employee> page = employeeRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/employees");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /employees/:id : get the "id" employee.
     *
     * @param id the id of the employee to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the employee, or with status 404 (Not Found)
     */
    @GetMapping("/employees/{id}")
    @Timed
    public ResponseEntity<Employee> getEmployee(@PathVariable Long id) {
        log.debug("REST request to get Employee : {}", id);
        Optional<Employee> employee = employeeRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(employee);
    }

    /**
     * DELETE  /employees/:id : delete the "id" employee.
     *
     * @param id the id of the employee to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/employees/{id}")
    @Timed
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        log.debug("REST request to delete Employee : {}", id);

        employeeRepository.deleteById(id);
        employeeSearchRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * SEARCH  /_search/employees?query=:query : search for the employee corresponding
     * to the query.
     *
     * @param query the query of the employee search
     * @param pageable the pagination information
     * @return the result of the search
     */
    @GetMapping("/_search/employees")
    @Timed
    public ResponseEntity<List<Employee>> searchEmployees(@RequestParam String query, Pageable pageable) {
        log.debug("REST request to search for a page of Employees for query {}", query);
        Page<Employee> page = employeeSearchRepository.search(queryStringQuery(query), pageable);
        HttpHeaders headers = PaginationUtil.generateSearchPaginationHttpHeaders(query, page, "/api/_search/employees");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

}
