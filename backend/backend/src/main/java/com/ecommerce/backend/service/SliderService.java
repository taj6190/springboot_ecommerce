package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Slider;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.SliderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SliderService {

    private final SliderRepository sliderRepository;

    @Cacheable(value = "homepage", key = "'sliders'")
    @Transactional(readOnly = true)
    public List<Slider> getActiveSliders() {
        return sliderRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<Slider> getAllSliders() {
        return sliderRepository.findAll();
    }

    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public Slider createSlider(Slider slider) {
        return sliderRepository.save(slider);
    }

    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public Slider updateSlider(UUID id, Slider updated) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slider", "id", id));
        slider.setTitleEn(updated.getTitleEn());
        slider.setTitleBn(updated.getTitleBn());
        slider.setSubtitleEn(updated.getSubtitleEn());
        slider.setSubtitleBn(updated.getSubtitleBn());
        slider.setImageUrl(updated.getImageUrl());
        slider.setLinkUrl(updated.getLinkUrl());
        slider.setDisplayOrder(updated.getDisplayOrder());
        slider.setActive(updated.isActive());
        slider.setStartDate(updated.getStartDate());
        slider.setEndDate(updated.getEndDate());
        return sliderRepository.save(slider);
    }

    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public void deleteSlider(UUID id) {
        if (!sliderRepository.existsById(id)) throw new ResourceNotFoundException("Slider", "id", id);
        sliderRepository.deleteById(id);
    }

    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public void deleteSliders(List<UUID> ids) {
        ids.forEach(this::deleteSlider);
    }

    @CacheEvict(value = "homepage", key = "'sliders'")
    @Transactional
    public void reorderSliders(List<UUID> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Slider slider = sliderRepository.findById(orderedIds.get(i)).orElse(null);
            if (slider != null) {
                slider.setDisplayOrder(i);
                sliderRepository.save(slider);
            }
        }
    }
}
