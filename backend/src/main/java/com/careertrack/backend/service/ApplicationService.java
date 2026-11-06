
package com.careertrack.backend.service;

import com.careertrack.backend.entity.Application;
import com.careertrack.backend.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepository repository;

    public ApplicationService(ApplicationRepository repository) {
        this.repository = repository;
    }

    public List<Application> getAllApplications() {
        return repository.findAll();
    }

    public Optional<Application> getApplicationById(Long id) {
        return repository.findById(id);
    }

    public Application saveApplication(Application application) {
        return repository.save(application);
    }

    public void deleteApplication(Long id) {
        repository.deleteById(id);
    }
}
