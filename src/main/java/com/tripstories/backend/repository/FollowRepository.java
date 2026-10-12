package com.tripstories.backend.repository;

import com.tripstories.backend.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    List<Follow> findByFollowingEmail(String followingEmail);

    List<Follow> findByFollowerEmail(String followerEmail);

    Optional<Follow> findByFollowerEmailAndFollowingEmail(
            String followerEmail,
            String followingEmail
    );

}