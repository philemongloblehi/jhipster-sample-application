package io.github.jhipster.application.repository.search;

import io.github.jhipster.application.domain.Task;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the Task entity.
 */
public interface TaskSearchRepository extends ElasticsearchRepository<Task, Long> {
}
