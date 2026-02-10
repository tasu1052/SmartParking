package com.example.smartParking.repository;

import com.example.smartParking.entity.ParkingSpot;
import com.example.smartParking.entity.Reservation;
import com.example.smartParking.entity.ReservationStatus;
import com.example.smartParking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    boolean existsByParkingSpotAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            ParkingSpot parkingSpot,
            ReservationStatus status,
            LocalDateTime endTime,
            LocalDateTime startTime);

    List<Reservation> findByUser(User user);

    List<Reservation> findByParkingSpot(ParkingSpot parkingSpot);

//    List<Reservation> findByUserAndStatusAndEndTimeAfter(
//            User user,
//            ReservationStatus status,
//            LocalDateTime now
//    );
//
////    List<Reservation> findByUserAndEndTimeBefore(
////            User user,
////            LocalDateTime now
////    );

    List<Reservation> findByStatusAndEndTimeBefore(
            ReservationStatus status,
            LocalDateTime time
    );

    @Query("""
            SELECT r FROM Reservation r
            JOIN FETCH r.user
            JOIN FETCH r.parkingSpot
            WHERE r.status = :status
            """)
    List<Reservation> findAllByStatus(
            @Param("status") ReservationStatus status
    );

    @Query("""
    SELECT r FROM Reservation r
    JOIN FETCH r.parkingSpot ps
    JOIN FETCH ps.parkingLot pl
    WHERE r.user = :user
      AND r.status = :status
      AND r.endTime > :now
    ORDER BY r.startTime DESC
""")
    List<Reservation> findMyCurrentWithSpotLot(
            @Param("user") User user,
            @Param("status") ReservationStatus status,
            @Param("now") LocalDateTime now
    );

    @Query("""
    SELECT r FROM Reservation r
    JOIN FETCH r.parkingSpot ps
    JOIN FETCH ps.parkingLot pl
    WHERE r.user = :user
      AND r.endTime < :now
    ORDER BY r.startTime DESC
""")
    List<Reservation> findMyHistoryWithSpotLot(
            @Param("user") User user,
            @Param("now") LocalDateTime now
    );
}
